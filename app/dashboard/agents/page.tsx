import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Phone, FileText, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";

export default async function AgentsPage() {
  const session = await auth();
  if (session!.user.role !== "BROKER") redirect("/dashboard");

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: {
      clients: { select: { id: true } },
      transactions: { select: { id: true, status: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} in the office
          </p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No agents yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Add agents to start assigning clients and transactions
          </p>
          <Link
            href="/dashboard/agents/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            Add First Agent
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {agents.map((agent) => {
            const activeTx = agent.transactions.filter((t) => t.status === "ACTIVE").length;
            const completedTx = agent.transactions.filter((t) => t.status === "COMPLETED").length;

            return (
              <div
                key={agent.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    agent.isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{agent.name}</p>
                    {!agent.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      {agent.email}
                    </span>
                    {agent.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {agent.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{agent.clients.length}</p>
                    <p className="text-xs text-gray-400">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{activeTx}</p>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{completedTx}</p>
                    <p className="text-xs text-gray-400">Closed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/agents/${agent.id}`}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                    >
                      View
                    </Link>
                    <DeactivateAgentButton
                      agentId={agent.id}
                      isActive={agent.isActive}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
