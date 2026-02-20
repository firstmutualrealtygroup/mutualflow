"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MoreVertical, X } from "lucide-react";

interface TransactionActionsProps {
  transactionId: string;
  currentStatus: string;
  isBroker: boolean;
  clientName: string;
  agentName: string;
  agentId: string;
  currentUserId: string;
}

export default function TransactionActions({
  transactionId,
  currentStatus,
  isBroker,
  clientName,
  agentName,
  agentId,
  currentUserId,
}: TransactionActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isAgent = !isBroker;
  const isMyTransaction = agentId === currentUserId;

  async function submitToBroker() {
    setLoading(true);
    const res = await fetch(`/api/transactions/${transactionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setLoading(false);
    if (res.ok) {
      setShowSubmit(false);
      setOpen(false);
      router.refresh();
    }
  }

  async function approveTransaction() {
    setLoading(true);
    await fetch(`/api/transactions/${transactionId}/approve`, { method: "POST" });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
            {/* Agent actions */}
            {isAgent && isMyTransaction && currentStatus === "ACTIVE" && (
              <button
                onClick={() => { setShowSubmit(true); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Send className="w-4 h-4 text-blue-500" />
                Submit to Broker for Review
              </button>
            )}

            {/* Broker actions */}
            {isBroker && (
              <button
                onClick={approveTransaction}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Send className="w-4 h-4 text-green-500" />
                Approve Transaction
              </button>
            )}

            <button
              onClick={async () => {
                await fetch(`/api/transactions/${transactionId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "CANCELLED" }),
                });
                setOpen(false);
                router.refresh();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <X className="w-4 h-4" />
              Cancel Transaction
            </button>
          </div>
        </>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Submit to Broker
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Submit <strong>{clientName}</strong>&apos;s transaction to your broker for review.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              placeholder="Optional message for the broker..."
            />
            <div className="flex items-center gap-2">
              <button
                onClick={submitToBroker}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? "Submitting..." : "Submit for Review"}
              </button>
              <button
                onClick={() => setShowSubmit(false)}
                className="px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
