import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, FileText, Users, Edit } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session!.user.role !== "BROKER") redirect("/dashboard");

  const agent = await prisma.user.findUnique({
    where: { id },
    include: {
      clients: { orderBy: { createdAt: "desc" }, take: 10 },
      transactions: {
        include: { client: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!agent || agent.role !== "AGENT") notFound();

  const activeTx = agent.transactions.filter((t) => t.status === "ACTIVE").length;
  const completedTx = agent.transactions.filter((t) => t.status === "COMPLETED").length;

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
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agents" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
            <p className="text-sm text-gray-500">Agent Profile</p>
          </div>
        </div>
        <Link
          href={`/dashboard/agents/${id}/edit`}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Agent Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 ${
                agent.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
              }`}
            >
              {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <h2 className="font-semibold text-gray-900">{agent.name}</h2>
            {!agent.isActive && (
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Joined {formatDate(agent.createdAt)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{agent.email}</span>
            </div>
            {agent.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                {agent.phone}
              </div>
            )}
            {agent.licenseNumber && (
              <div className="text-xs text-gray-500">
                License: {agent.licenseNumber}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-gray-900">{agent.clients.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Clients</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-blue-600">{activeTx}</p>
              <p className="text-xs text-gray-400 mt-0.5">Active</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-green-600">{completedTx}</p>
              <p className="text-xs text-gray-400 mt-0.5">Closed</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Recent Transactions ({agent.transactions.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {agent.transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No transactions yet
                </div>
              ) : (
                agent.transactions.map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/dashboard/transactions/${tx.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.client.firstName} {tx.client.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{tx.propertyAddress}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {tx.status === "ACTIVE" && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            stageColors[tx.currentStage] ?? "bg-gray-100"
                          }`}
                        >
                          {stageLabels[tx.currentStage]}
                        </span>
                      )}
                      {tx.purchasePrice && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(tx.purchasePrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
