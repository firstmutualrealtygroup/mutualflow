import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientForm from "@/components/clients/ClientForm";

export default async function NewClientPage() {
  const session = await auth();
  const isBroker = session!.user.role === "BROKER";

  const agents = isBroker
    ? await prisma.user.findMany({
        where: { role: "AGENT", isActive: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Fill in the client&apos;s information below
        </p>
      </div>
      <ClientForm
        agents={agents}
        currentUserId={session!.user.id}
        isBroker={isBroker}
      />
    </div>
  );
}
