"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, ExternalLink, X } from "lucide-react";

interface Document {
  id: string;
  name: string;
  originalName: string;
  category: string;
  fileType?: string | null;
  fileSize?: number | null;
  driveUrl?: string | null;
  filePath?: string | null;
  createdAt: Date;
}

interface DocumentUploaderProps {
  transactionId: string;
  initialDocuments: Document[];
}

const CATEGORIES = [
  { value: "PURCHASE", label: "Purchase Documents" },
  { value: "DISCLOSURE", label: "Disclosures" },
  { value: "SUPPORTING", label: "Supporting Documents" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

const categoryColors: Record<string, string> = {
  PURCHASE: "bg-blue-100 text-blue-700",
  DISCLOSURE: "bg-purple-100 text-purple-700",
  SUPPORTING: "bg-green-100 text-green-700",
  MISCELLANEOUS: "bg-gray-100 text-gray-600",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentUploader({
  transactionId,
  initialDocuments,
}: DocumentUploaderProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [category, setCategory] = useState("SUPPORTING");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("transactionId", transactionId);

    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
    }
    setUploading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function deleteDoc(docId: string) {
    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const filtered =
    activeFilter === "ALL"
      ? documents
      : documents.filter((d) => d.category === activeFilter);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-900">Documents</h2>
          <p className="text-xs text-gray-400 mt-0.5">{documents.length} file{documents.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className={`w-6 h-6 mx-auto mb-2 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
          <p className="text-sm text-gray-600">
            {uploading ? "Uploading..." : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG up to 20MB</p>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {documents.length > 0 && (
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeFilter === "ALL"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({documents.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = documents.filter((d) => d.category === c.value).length;
            if (count === 0) return null;
            return (
              <button
                key={c.value}
                onClick={() => setActiveFilter(c.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeFilter === c.value
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Document List */}
      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="px-5 py-6 text-center text-gray-400 text-sm">
            No documents uploaded yet.
          </div>
        ) : (
          filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 px-5 py-3.5 group hover:bg-gray-50 transition"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      categoryColors[doc.category] ?? "bg-gray-100"
                    }`}
                  >
                    {CATEGORIES.find((c) => c.value === doc.category)?.label ?? doc.category}
                  </span>
                  {doc.fileSize && (
                    <span className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {doc.driveUrl && (
                  <a
                    href={doc.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
