import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, email, phone, address, city, state, zipCode, notes, agentId } = body;

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 });
  }

  const assignedAgentId = session.user.role === "BROKER" && agentId ? agentId : session.user.id;

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      notes: notes || null,
      agentId: assignedAgentId,
    },
  });

  return NextResponse.json(client);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isBroker = session.user.role === "BROKER";

  const clients = await prisma.client.findMany({
    where: isBroker ? {} : { agentId: session.user.id },
    include: { agent: true, transactions: { select: { id: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}
