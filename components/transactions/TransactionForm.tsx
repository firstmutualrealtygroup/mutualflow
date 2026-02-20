"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Agent {
  id: string;
  name: string;
}

interface TransactionFormProps {
  clients: Client[];
  agents: Agent[];
  currentUserId: string;
  isBroker: boolean;
  preselectedClientId?: string;
  initialData?: {
    id: string;
    clientId: string;
    agentId: string;
    type: string;
    propertyAddress: string;
    propertyCity?: string | null;
    propertyState?: string | null;
    propertyZip?: string | null;
    purchasePrice?: number | null;
    mlsNumber?: string | null;
    escrowNumber?: string | null;
    closingDate?: Date | null;
    notes?: string | null;
  };
}

export default function TransactionForm({
  clients,
  agents,
  currentUserId,
  isBroker,
  preselectedClientId,
  initialData,
}: TransactionFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    clientId: initialData?.clientId ?? preselectedClientId ?? "",
    agentId: initialData?.agentId ?? currentUserId,
    type: initialData?.type ?? "PURCHASE",
    propertyAddress: initialData?.propertyAddress ?? "",
    propertyCity: initialData?.propertyCity ?? "",
    propertyState: initialData?.propertyState ?? "",
    propertyZip: initialData?.propertyZip ?? "",
    purchasePrice: initialData?.purchasePrice?.toString() ?? "",
    mlsNumber: initialData?.mlsNumber ?? "",
    escrowNumber: initialData?.escrowNumber ?? "",
    closingDate: initialData?.closingDate
      ? new Date(initialData.closingDate).toISOString().split("T")[0]
      : "",
    notes: initialData?.notes ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEditing
      ? `/api/transactions/${initialData.id}`
      : "/api/transactions";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
        closingDate: form.closingDate || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    const data = await res.json();
    router.push(`/dashboard/transactions/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Transaction Type */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
          Transaction Type
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "PURCHASE", label: "Purchase", desc: "We represent the buyer" },
            { value: "SALE", label: "Sale", desc: "We represent the seller" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("type", opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                form.type === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Client & Agent */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
          Client & Agent
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Client *
          </label>
          <select
            value={form.clientId}
            onChange={(e) => update("clientId", e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {c.email}
              </option>
            ))}
          </select>
        </div>

        {isBroker && agents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assigned Agent *
            </label>
            <select
              value={form.agentId}
              onChange={(e) => update("agentId", e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select an agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
          Property Details
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Property Address *
          </label>
          <input
            type="text"
            required
            value={form.propertyAddress}
            onChange={(e) => update("propertyAddress", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input
              type="text"
              value={form.propertyCity}
              onChange={(e) => update("propertyCity", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Los Angeles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input
              type="text"
              value={form.propertyState}
              onChange={(e) => update("propertyState", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP</label>
            <input
              type="text"
              value={form.propertyZip}
              onChange={(e) => update("propertyZip", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90001"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={form.purchasePrice}
                onChange={(e) => update("purchasePrice", e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500,000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Closing Date
            </label>
            <input
              type="date"
              value={form.closingDate}
              onChange={(e) => update("closingDate", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              MLS Number
            </label>
            <input
              type="text"
              value={form.mlsNumber}
              onChange={(e) => update("mlsNumber", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MLS-12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Escrow Number
            </label>
            <input
              type="text"
              value={form.escrowNumber}
              onChange={(e) => update("escrowNumber", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ESC-67890"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Any notes about this transaction..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
        >
          <Save className="w-4 h-4" />
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Transaction"
            : "Create Transaction"}
        </button>
      </div>
    </form>
  );
}
