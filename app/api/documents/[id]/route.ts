import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id }, include: { transaction: true } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBroker = session.user.role === "BROKER";
  if (!isBroker && doc.transaction.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Try to delete local file
  if (doc.filePath) {
    try {
      await unlink(join(process.cwd(), doc.filePath));
    } catch {
      // ignore if file doesn't exist
    }
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
