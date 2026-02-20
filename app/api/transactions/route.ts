import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { STAGES } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    clientId, agentId, type, propertyAddress, propertyCity, propertyState,
    propertyZip, purchasePrice, closingDate, mlsNumber, escrowNumber, notes,
  } = body;

  if (!clientId || !propertyAddress || !type) {
    return NextResponse.json({ error: "Client, property address, and type are required" }, { status: 400 });
  }

  const assignedAgentId = session.user.role === "BROKER" && agentId ? agentId : session.user.id;

  const transaction = await prisma.transaction.create({
    data: {
      clientId,
      agentId: assignedAgentId,
      type,
      propertyAddress,
      propertyCity: propertyCity || null,
      propertyState: propertyState || null,
      propertyZip: propertyZip || null,
      purchasePrice: purchasePrice || null,
      closingDate: closingDate ? new Date(closingDate) : null,
      mlsNumber: mlsNumber || null,
      escrowNumber: escrowNumber || null,
      notes: notes || null,
      currentStage: "DUE_DILIGENCE",
      stages: {
        create: STAGES.map((s, i) => ({
          stageName: s.key,
          status: i === 0 ? "ACTIVE" : "PENDING",
          startDate: i === 0 ? new Date() : null,
        })),
      },
    },
  });

  return NextResponse.json(transaction);
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isBroker = session.user.role === "BROKER";

  const transactions = await prisma.transaction.findMany({
    where: isBroker ? {} : { agentId: session.user.id },
    include: { client: true, agent: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(transactions);
}
