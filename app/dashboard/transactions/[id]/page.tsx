import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Home, DollarSign, Calendar, Hash, Edit,
  FileText, Mail, CheckCircle, Clock, User
} from "lucide-react";
import { formatCurrency, formatDate, STAGES } from "@/lib/utils";
import StageManager from "@/components/transactions/StageManager";
import TaskManager from "@/components/transactions/TaskManager";
import DocumentUploader from "@/components/transactions/DocumentUploader";
import TransactionActions from "@/components/transactions/TransactionActions";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isBroker = session!.user.role === "BROKER";

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      client: true,
      agent: true,
      stages: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "asc" } },
      emailCampaigns: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!tx) notFound();
  if (!isBroker && tx.agentId !== session!.user.id) redirect("/dashboard/transactions");

  const currentStageIdx = STAGES.findIndex((s) => s.key === tx.currentStage);

  const statusBadge: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/transactions"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {tx.client.firstName} {tx.client.lastName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  statusBadge[tx.status] ?? "bg-gray-100"
                }`}
              >
                {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                {tx.type === "PURCHASE" ? "Purchase" : "Sale"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <Home className="w-3 h-3" />
              {tx.propertyAddress}
              {tx.propertyCity && `, ${tx.propertyCity}`}
              {tx.propertyState && `, ${tx.propertyState}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/transactions/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <TransactionActions
            transactionId={id}
            currentStatus={tx.status}
            isBroker={isBroker}
            clientName={`${tx.client.firstName} ${tx.client.lastName}`}
            agentName={tx.agent.name}
            agentId={tx.agentId}
            currentUserId={session!.user.id}
          />
        </div>
      </div>

      {/* Stage Roadmap */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Transaction Roadmap</h2>
          <span className="text-xs text-gray-400">
            Stage {currentStageIdx + 1} of {STAGES.length}
          </span>
        </div>

        {/* Visual Roadmap */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-200 z-0">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stage Steps */}
          <div className="relative z-10 grid grid-cols-4 gap-2">
            {STAGES.map((stage, i) => {
              const isCompleted = i < currentStageIdx;
              const isCurrent = i === currentStageIdx;
              const isPending = i > currentStageIdx;
              const stageRecord = tx.stages.find((s) => s.stageName === stage.key);

              const stageIcons: Record<string, string> = {
                DUE_DILIGENCE: "🔍",
                APPRAISAL: "📊",
                LOAN_CONTINGENCY: "🏦",
                CLOSE_OF_ESCROW: "🎉",
              };

              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span>{stageIcons[stage.key]}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-blue-700"
                          : isCompleted
                          ? "text-green-700"
                          : "text-gray-400"
                      }`}
                    >
                      {stage.shortLabel}
                    </p>
                    {isCurrent && (
                      <span className="inline-block text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                        Active
                      </span>
                    )}
                    {isCompleted && stageRecord?.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(stageRecord.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Description */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {
                {
                  DUE_DILIGENCE: "🔍",
                  APPRAISAL: "📊",
                  LOAN_CONTINGENCY: "🏦",
                  CLOSE_OF_ESCROW: "🎉",
                }[tx.currentStage]
              }
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">
                Currently: {STAGES[currentStageIdx]?.label}
              </p>
              <p className="text-blue-700 text-xs mt-0.5">
                {STAGES[currentStageIdx]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Controls */}
        {tx.status === "ACTIVE" && (
          <StageManager
            transactionId={id}
            currentStage={tx.currentStage}
            clientEmail={tx.client.email}
            clientName={`${tx.client.firstName} ${tx.client.lastName}`}
          />
        )}
      </div>

      {/* Transaction Details Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Details */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Transaction Details
            </h3>
            {tx.purchasePrice && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatCurrency(tx.purchasePrice)}</span>
              </div>
            )}
            {tx.closingDate && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Closing: {formatDate(tx.closingDate)}</span>
              </div>
            )}
            {tx.mlsNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-gray-400" />
                <span>MLS: {tx.mlsNumber}</span>
              </div>
            )}
            {tx.escrowNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-gray-400" />
                <span>Escrow: {tx.escrowNumber}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Created {formatDate(tx.createdAt)}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Client
            </h3>
            <Link
              href={`/dashboard/clients/${tx.clientId}`}
              className="flex items-center gap-3 hover:text-blue-600 transition group"
            >
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                {tx.client.firstName[0]}{tx.client.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {tx.client.firstName} {tx.client.lastName}
                </p>
                <p className="text-xs text-gray-500">{tx.client.email}</p>
              </div>
            </Link>
          </div>

          {/* Agent Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Agent
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                {tx.agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{tx.agent.name}</p>
                <p className="text-xs text-gray-500">{tx.agent.email}</p>
              </div>
            </div>
          </div>

          {/* Email History */}
          {tx.emailCampaigns.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Emails Sent
              </h3>
              <div className="space-y-2">
                {tx.emailCampaigns.map((email) => (
                  <div key={email.id} className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{email.subject}</p>
                      <p className="text-xs text-gray-400">{formatDate(email.createdAt)}</p>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        email.status === "SENT"
                          ? "bg-green-100 text-green-700"
                          : email.status === "FAILED"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {email.status === "SENT" ? "✓" : email.status === "FAILED" ? "✗" : "…"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tasks + Documents */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tasks */}
          <TaskManager
            transactionId={id}
            initialTasks={tx.tasks}
          />

          {/* Documents */}
          <DocumentUploader
            transactionId={id}
            initialDocuments={tx.documents}
          />
        </div>
      </div>

      {/* Notes */}
      {tx.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{tx.notes}</p>
        </div>
      )}
    </div>
  );
}
