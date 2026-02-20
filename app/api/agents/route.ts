import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "BROKER") {
    return NextResponse.json({ error: "Broker access required" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, phone, licenseNumber } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const agent = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "AGENT",
      phone: phone || null,
      licenseNumber: licenseNumber || null,
    },
  });

  return NextResponse.json({ id: agent.id, name: agent.name, email: agent.email });
}
