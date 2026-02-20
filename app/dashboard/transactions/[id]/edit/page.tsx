import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import TransactionForm from "@/components/transactions/TransactionForm";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const isBroker = session!.user.role === "BROKER";

  const [tx, clients, agents] = await Promise.all([
    prisma.transaction.findUnique({ where: { id } }),
    prisma.client.findMany({
      where: isBroker ? {} : { agentId: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    isBroker
      ? prisma.user.findMany({
          where: { role: "AGENT", isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!tx) notFound();
  if (!isBroker && tx.agentId !== userId) redirect("/dashboard/transactions");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="text-gray-500 text-sm mt-0.5">{tx.propertyAddress}</p>
      </div>
      <TransactionForm
        clients={clients}
        agents={agents}
        currentUserId={userId}
        isBroker={isBroker}
        initialData={tx}
      />
    </div>
  );
}
