import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import TransactionForm from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const isBroker = session!.user.role === "BROKER";
  const params = await searchParams;
  const preselectedClientId = params.clientId ?? "";

  const [clients, agents] = await Promise.all([
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

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Transaction</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Start tracking a new real estate transaction
        </p>
      </div>
      <TransactionForm
        clients={clients}
        agents={agents}
        currentUserId={userId}
        isBroker={isBroker}
        preselectedClientId={preselectedClientId}
      />
    </div>
  );
}
