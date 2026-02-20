import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "SUPPORTING";
  const transactionId = formData.get("transactionId") as string;

  if (!file || !transactionId) {
    return NextResponse.json({ error: "File and transaction ID required" }, { status: 400 });
  }

  // Verify access to transaction
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const isBroker = session.user.role === "BROKER";
  if (!isBroker && tx.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Save file locally
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "bin";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = join(process.cwd(), "uploads", transactionId);

  await mkdir(uploadDir, { recursive: true });
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const doc = await prisma.document.create({
    data: {
      transactionId,
      name: file.name,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
      filePath: `/uploads/${transactionId}/${fileName}`,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(doc);
}
