"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";
import { STAGES } from "@/lib/utils";

interface StageManagerProps {
  transactionId: string;
  currentStage: string;
  clientEmail: string;
  clientName: string;
}

export default function StageManager({
  transactionId,
  currentStage,
  clientEmail,
  clientName,
}: StageManagerProps) {
  const router = useRouter();
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
  const nextStage = STAGES[currentIdx + 1];
  const isLastStage = currentIdx === STAGES.length - 1;

  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function advanceStage() {
    if (!nextStage) return;
    setLoading(true);

    const res = await fetch(`/api/transactions/${transactionId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStage: nextStage.key,
        sendNotification: sendEmail,
      }),
    });

    setLoading(false);
    setShowConfirm(false);

    if (res.ok) {
      router.refresh();
    }
  }

  async function markCompleted() {
    setLoading(true);
    await fetch(`/api/transactions/${transactionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setLoading(false);
    setShowConfirm(false);
    router.refresh();
  }

  if (isLastStage) {
    return (
      <div className="mt-5 pt-5 border-t border-gray-100">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Completed
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-green-800 font-medium">
              Mark this transaction as completed?
            </p>
            <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded"
              />
              Send celebration email to {clientName}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={markCompleted}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? "Processing..." : "Yes, Complete Transaction"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!nextStage}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition"
        >
          <ArrowRight className="w-4 h-4" />
          Advance to {nextStage?.label}
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-blue-800 font-medium">
            Advance to <strong>{nextStage?.label}</strong>?
          </p>
          <label className="flex items-center gap-2 text-sm text-blue-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded"
            />
            <Mail className="w-3.5 h-3.5" />
            Send stage notification email to {clientName} ({clientEmail})
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={advanceStage}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
            >
              {loading ? "Processing..." : "Yes, Advance Stage"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
