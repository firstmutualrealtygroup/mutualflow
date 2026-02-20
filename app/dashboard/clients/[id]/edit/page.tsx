import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ClientForm from "@/components/clients/ClientForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isBroker = session!.user.role === "BROKER";

  const [client, agents] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    isBroker
      ? prisma.user.findMany({
          where: { role: "AGENT", isActive: true },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!client) notFound();
  if (!isBroker && client.agentId !== session!.user.id) redirect("/dashboard/clients");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {client.firstName} {client.lastName}
        </p>
      </div>
      <ClientForm
        agents={agents}
        currentUserId={session!.user.id}
        isBroker={isBroker}
        initialData={client}
      />
    </div>
  );
}
