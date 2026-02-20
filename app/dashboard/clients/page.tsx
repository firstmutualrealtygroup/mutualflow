import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { UserPlus, Search, Phone, Mail, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const isBroker = session!.user.role === "BROKER";
  const params = await searchParams;
  const search = params.search ?? "";

  const clients = await prisma.client.findMany({
    where: {
      ...(isBroker ? {} : { agentId: userId }),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: { agent: true, transactions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Search */}
      <form>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Client Cards */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No clients yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Add your first client to get started
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => {
            const activeTx = client.transactions.filter(
              (t) => t.status === "ACTIVE"
            ).length;
            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition group"
              >
                <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                  {client.firstName[0]}
                  {client.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {client.firstName} {client.lastName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                    )}
                    {client.city && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {client.city}, {client.state}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  {isBroker && (
                    <p className="text-xs text-gray-500">{client.agent.name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Added {formatDate(client.createdAt)}
                  </p>
                  {activeTx > 0 && (
                    <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {activeTx} active tx
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
