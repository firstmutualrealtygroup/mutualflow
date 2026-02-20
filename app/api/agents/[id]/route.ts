import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "BROKER") {
    return NextResponse.json({ error: "Broker access required" }, { status: 403 });
  }

  const { id } = await params;
  const agent = await prisma.user.findUnique({
    where: { id },
    include: {
      clients: true,
      transactions: { include: { client: true } },
    },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "BROKER") {
    return NextResponse.json({ error: "Broker access required" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, email, phone, licenseNumber, password, isActive } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone || null;
  if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber || null;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const agent = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(agent);
}
