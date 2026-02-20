import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { message } = body;

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { client: true, agent: true, documents: true, stages: true },
  });

  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (tx.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.transaction.update({
    where: { id },
    data: { submittedAt: new Date() },
  });

  // Find broker to notify
  const broker = await prisma.user.findFirst({ where: { role: "BROKER" } });

  if (broker) {
    const stageLabel: Record<string, string> = {
      DUE_DILIGENCE: "Due Diligence",
      APPRAISAL: "Appraisal",
      LOAN_CONTINGENCY: "Loan Contingency",
      CLOSE_OF_ESCROW: "Close of Escrow",
    };

    await sendEmail({
      to: broker.email,
      subject: `Transaction Review Request: ${tx.client.firstName} ${tx.client.lastName} — ${tx.propertyAddress}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1e40af;">Transaction Review Request</h2>
          <p><strong>Agent:</strong> ${tx.agent.name}</p>
          <p><strong>Client:</strong> ${tx.client.firstName} ${tx.client.lastName}</p>
          <p><strong>Property:</strong> ${tx.propertyAddress}</p>
          <p><strong>Transaction Type:</strong> ${tx.type}</p>
          <p><strong>Current Stage:</strong> ${stageLabel[tx.currentStage] ?? tx.currentStage}</p>
          <p><strong>Documents:</strong> ${tx.documents.length} attached</p>
          ${message ? `<p><strong>Agent Notes:</strong> ${message}</p>` : ""}
          <p style="margin-top:24px;">
            Please log in to MutualFlow to review and approve this transaction.
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
