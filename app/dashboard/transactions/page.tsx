import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Home, Filter } from "lucide-react";
import { formatCurrency, formatDate, STAGES } from "@/lib/utils";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const isBroker = session!.user.role === "BROKER";
  const params = await searchParams;
  const statusFilter = params.status ?? "ACTIVE";
  const typeFilter = params.type ?? "";

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(isBroker ? {} : { agentId: userId }),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
    },
    include: {
      client: true,
      agent: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const stageColors: Record<string, string> = {
    DUE_DILIGENCE: "bg-blue-100 text-blue-700 border-blue-200",
    APPRAISAL: "bg-purple-100 text-purple-700 border-purple-200",
    LOAN_CONTINGENCY: "bg-orange-100 text-orange-700 border-orange-200",
    CLOSE_OF_ESCROW: "bg-green-100 text-green-700 border-green-200",
  };

  const stageLabels: Record<string, string> = {
    DUE_DILIGENCE: "Due Diligence",
    APPRAISAL: "Appraisal",
    LOAN_CONTINGENCY: "Loan Contingency",
    CLOSE_OF_ESCROW: "Close of Escrow",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {[
          { label: "Active", value: "ACTIVE" },
          { label: "Completed", value: "COMPLETED" },
          { label: "All", value: "" },
        ].map((f) => (
          <Link
            key={f.value}
            href={`/dashboard/transactions?status=${f.value}${typeFilter ? `&type=${typeFilter}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              statusFilter === f.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <span className="text-gray-200">|</span>
        {[
          { label: "All Types", value: "" },
          { label: "Purchase", value: "PURCHASE" },
          { label: "Sale", value: "SALE" },
        ].map((f) => (
          <Link
            key={f.value}
            href={`/dashboard/transactions?type=${f.value}${statusFilter ? `&status=${statusFilter}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              typeFilter === f.value
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions found</h3>
          <p className="text-gray-500 text-sm mb-4">
            Create your first transaction to get started
          </p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const stageIdx = STAGES.findIndex((s) => s.key === tx.currentStage);
            return (
              <Link
                key={tx.id}
                href={`/dashboard/transactions/${tx.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {tx.client.firstName} {tx.client.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{tx.propertyAddress}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.type === "PURCHASE" ? "Buyer" : "Seller"} ·{" "}
                    {tx.purchasePrice ? formatCurrency(tx.purchasePrice) : "Price TBD"}
                    {isBroker && ` · ${tx.agent.name}`}
                  </p>
                </div>
                <div className="shrink-0 text-right space-y-2">
                  {tx.status === "ACTIVE" && (
                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${
                        stageColors[tx.currentStage] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stageLabels[tx.currentStage]}
                    </span>
                  )}
                  {tx.status !== "ACTIVE" && (
                    <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                      {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                    </span>
                  )}
                  {/* Mini stage progress */}
                  {tx.status === "ACTIVE" && (
                    <div className="flex items-center gap-1 justify-end">
                      {STAGES.map((s, i) => (
                        <div
                          key={s.key}
                          className={`w-2 h-2 rounded-full ${
                            i < stageIdx
                              ? "bg-green-400"
                              : i === stageIdx
                              ? "bg-blue-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(tx.updatedAt)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
