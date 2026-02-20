import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AgentForm from "@/components/agents/AgentForm";

export default async function NewAgentPage() {
  const session = await auth();
  if (session!.user.role !== "BROKER") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Agent</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Create an agent account for your office
        </p>
      </div>
      <AgentForm />
    </div>
  );
}
