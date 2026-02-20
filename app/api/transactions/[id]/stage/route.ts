import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { STAGES } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import {
  dueDiligenceEmail,
  appraisalEmail,
  loanContingencyEmail,
  closeOfEscrowEmail,
} from "@/lib/email-templates";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { newStage, sendNotification } = body;

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { client: true, agent: true, stages: true },
  });

  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBroker = session.user.role === "BROKER";
  if (!isBroker && tx.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stageKeys = STAGES.map((s) => s.key);
  if (!stageKeys.includes(newStage as never)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const currentIdx = stageKeys.indexOf(tx.currentStage as never);
  const newIdx = stageKeys.indexOf(newStage as never);

  // Update transaction stage
  await prisma.transaction.update({
    where: { id },
    data: {
      currentStage: newStage,
      status: newStage === "CLOSE_OF_ESCROW" && currentIdx === 3 ? tx.status : "ACTIVE",
    },
  });

  // Update stage records
  const now = new Date();
  await prisma.transactionStage.updateMany({
    where: { transactionId: id, stageName: tx.currentStage },
    data: { status: "COMPLETED", completedAt: now, endDate: now },
  });
  await prisma.transactionStage.updateMany({
    where: { transactionId: id, stageName: newStage },
    data: { status: "ACTIVE", startDate: now },
  });

  // Send email notification if requested
  if (sendNotification) {
    const agentEmail = tx.agent.email;
    const agentPhone = tx.agent.phone ?? undefined;
    const clientName = `${tx.client.firstName} ${tx.client.lastName}`;
    const params = {
      clientName,
      agentName: tx.agent.name,
      propertyAddress: tx.propertyAddress,
      purchasePrice: tx.purchasePrice ?? undefined,
      agentPhone,
      agentEmail,
      closingDate: tx.closingDate ? new Date(tx.closingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : undefined,
    };

    let emailContent: { subject: string; html: string } | null = null;

    if (newStage === "DUE_DILIGENCE") {
      emailContent = dueDiligenceEmail(params);
    } else if (newStage === "APPRAISAL") {
      emailContent = appraisalEmail(params);
    } else if (newStage === "LOAN_CONTINGENCY") {
      emailContent = loanContingencyEmail(params);
    } else if (newStage === "CLOSE_OF_ESCROW") {
      emailContent = closeOfEscrowEmail(params);
    }

    if (emailContent) {
      try {
        await sendEmail({
          to: tx.client.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        await prisma.emailCampaign.create({
          data: {
            transactionId: id,
            stage: newStage,
            subject: emailContent.subject,
            body: emailContent.html,
            recipientEmail: tx.client.email,
            recipientName: clientName,
            status: "SENT",
            sentAt: new Date(),
          },
        });
      } catch (err) {
        console.error("[Email] Failed to send:", err);
        await prisma.emailCampaign.create({
          data: {
            transactionId: id,
            stage: newStage,
            subject: emailContent.subject,
            body: emailContent.html,
            recipientEmail: tx.client.email,
            recipientName: clientName,
            status: "FAILED",
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true, currentStage: newStage });
}
