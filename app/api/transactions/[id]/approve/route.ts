import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "BROKER") {
    return NextResponse.json({ error: "Broker access required" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.transaction.update({
    where: { id },
    data: { approvedAt: new Date(), status: "COMPLETED" },
  });

  return NextResponse.json({ success: true });
}
