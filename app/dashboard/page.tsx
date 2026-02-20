import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Users, FileText, CheckCircle, Clock, TrendingUp, Home } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, STAGES } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isBroker = session!.user.role === "BROKER";

  // Fetch stats
  const whereClause = isBroker ? {} : { agentId: userId };

  const [
    totalClients,
    activeTransactions,
    completedTransactions,
    recentTransactions,
    recentClients,
    agentCount,
  ] = await Promise.all([
    prisma.client.count({ where: whereClause }),
    prisma.transaction.count({
      where: { ...whereClause, status: "ACTIVE" },
    }),
    prisma.transaction.count({
      where: { ...whereClause, status: "COMPLETED" },
    }),
    prisma.transaction.findMany({
      where: whereClause,
      include: { client: true, agent: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.client.findMany({
      where: whereClause,
      include: { agent: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    isBroker ? prisma.user.count({ where: { role: "AGENT", isActive: true } }) : Promise.resolve(0),
  ]);

  const stageColors: Record<string, string> = {
    DUE_DILIGENCE: "bg-blue-100 text-blue-700",
    APPRAISAL: "bg-purple-100 text-purple-700",
    LOAN_CONTINGENCY: "bg-orange-100 text-orange-700",
    CLOSE_OF_ESCROW: "bg-green-100 text-green-700",
  };

  const stageLabels: Record<string, string> = {
    DUE_DILIGENCE: "Due Diligence",
    APPRAISAL: "Appraisal",
    LOAN_CONTINGENCY: "Loan Contingency",
    CLOSE_OF_ESCROW: "Close of Escrow",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session!.user.name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {isBroker ? "Broker overview — all agents" : "Your transactions and clients"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={totalClients}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50"
          href="/dashboard/clients"
        />
        <StatCard
          label="Active Transactions"
          value={activeTransactions}
          icon={<FileText className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-50"
          href="/dashboard/transactions"
        />
        <StatCard
          label="Completed"
          value={completedTransactions}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          bg="bg-green-50"
          href="/dashboard/transactions"
        />
        {isBroker ? (
          <StatCard
            label="Active Agents"
            value={agentCount}
            icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
            bg="bg-orange-50"
            href="/dashboard/agents"
          />
        ) : (
          <StatCard
            label="In Progress"
            value={activeTransactions}
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            bg="bg-orange-50"
            href="/dashboard/transactions"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <Link
              href="/dashboard/transactions"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No transactions yet.{" "}
                <Link href="/dashboard/transactions/new" className="text-blue-600 hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <Link
                  key={tx.id}
                  href={`/dashboard/transactions/${tx.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.client.firstName} {tx.client.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {tx.propertyAddress}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        stageColors[tx.currentStage] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stageLabels[tx.currentStage] ?? tx.currentStage}
                    </span>
                    {isBroker && (
                      <p className="text-xs text-gray-400 mt-0.5">{tx.agent.name}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Clients</h2>
            <Link
              href="/dashboard/clients"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentClients.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No clients yet.{" "}
                <Link href="/dashboard/clients/new" className="text-blue-600 hover:underline">
                  Add one
                </Link>
              </div>
            ) : (
              recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{client.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">{formatDate(client.createdAt)}</p>
                    {isBroker && (
                      <p className="text-xs text-gray-400">{client.agent.name}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
  href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </Link>
  );
}
