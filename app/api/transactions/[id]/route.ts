import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { client: true, agent: true, stages: true, documents: true, tasks: true, emailCampaigns: true },
  });

  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBroker = session.user.role === "BROKER";
  if (!isBroker && tx.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(tx);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBroker = session.user.role === "BROKER";
  if (!isBroker && tx.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    type, propertyAddress, propertyCity, propertyState, propertyZip,
    purchasePrice, closingDate, mlsNumber, escrowNumber, notes, status, agentId,
  } = body;

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
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
      status: status || tx.status,
      agentId: isBroker && agentId ? agentId : tx.agentId,
    },
  });

  return NextResponse.json(updated);
}
