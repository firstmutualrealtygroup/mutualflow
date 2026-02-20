import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import AgentForm from "@/components/agents/AgentForm";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session!.user.role !== "BROKER") redirect("/dashboard");

  const agent = await prisma.user.findUnique({ where: { id } });
  if (!agent || agent.role !== "AGENT") notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Agent</h1>
        <p className="text-gray-500 text-sm mt-0.5">{agent.name}</p>
      </div>
      <AgentForm initialData={agent} />
    </div>
  );
}
