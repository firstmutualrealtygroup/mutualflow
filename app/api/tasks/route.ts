import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { transactionId, title, description, priority, dueDate } = body;

  if (!transactionId || !title) {
    return NextResponse.json({ error: "Transaction ID and title required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      transactionId,
      title,
      description: description || null,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: session.user.id,
    },
  });

  return NextResponse.json(task);
}
