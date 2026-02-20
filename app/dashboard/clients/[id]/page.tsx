import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Edit, FileText, Plus, ArrowLeft, User
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import DeleteClientButton from "@/components/clients/DeleteClientButton";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isBroker = session!.user.role === "BROKER";

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      agent: true,
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();
  if (!isBroker && client.agentId !== session!.user.id) redirect("/dashboard/clients");

  const stageLabels: Record<string, string> = {
    DUE_DILIGENCE: "Due Diligence",
    APPRAISAL: "Appraisal",
    LOAN_CONTINGENCY: "Loan Contingency",
    CLOSE_OF_ESCROW: "Close of Escrow",
  };

  const stageColors: Record<string, string> = {
    DUE_DILIGENCE: "bg-blue-100 text-blue-700",
    APPRAISAL: "bg-purple-100 text-purple-700",
    LOAN_CONTINGENCY: "bg-orange-100 text-orange-700",
    CLOSE_OF_ESCROW: "bg-green-100 text-green-700",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-sm text-gray-500">Client Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/clients/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <DeleteClientButton clientId={id} clientName={`${client.firstName} ${client.lastName}`} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Client Info Card */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar + Name */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-700 mx-auto mb-3">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <h2 className="font-semibold text-gray-900">
              {client.firstName} {client.lastName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Client since {formatDate(client.createdAt)}
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Contact
            </h3>
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition"
            >
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{client.email}</span>
            </a>
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition"
              >
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                {client.phone}
              </a>
            )}
            {(client.address || client.city) && (
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  {client.address && <p>{client.address}</p>}
                  {(client.city || client.state) && (
                    <p>
                      {client.city}
                      {client.city && client.state ? ", " : ""}
                      {client.state} {client.zipCode}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Agent */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Assigned Agent
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                {client.agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {client.agent.name}
                </p>
                <p className="text-xs text-gray-500">{client.agent.role}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Notes
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Transactions ({client.transactions.length})
              </h2>
              <Link
                href={`/dashboard/transactions/new?clientId=${id}`}
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Transaction
              </Link>
            </div>

            {client.transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No transactions yet.{" "}
                <Link
                  href={`/dashboard/transactions/new?clientId=${id}`}
                  className="text-blue-600 hover:underline"
                >
                  Create one
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {client.transactions.map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/dashboard/transactions/${tx.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.propertyAddress}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tx.type === "PURCHASE" ? "Purchase" : "Sale"} ·{" "}
                        {tx.purchasePrice ? formatCurrency(tx.purchasePrice) : "Price TBD"} ·{" "}
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColors[tx.status] ?? "bg-gray-100"
                        }`}
                      >
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                      </span>
                      {tx.status === "ACTIVE" && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            stageColors[tx.currentStage] ?? "bg-gray-100"
                          }`}
                        >
                          {stageLabels[tx.currentStage]}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
