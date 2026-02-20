import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export const STAGES = [
  {
    key: "DUE_DILIGENCE",
    label: "Due Diligence",
    shortLabel: "Due Diligence",
    step: 1,
    color: "blue",
    description:
      "Inspection period to ensure you are 100% satisfied with the property condition.",
  },
  {
    key: "APPRAISAL",
    label: "Appraisal Contingency",
    shortLabel: "Appraisal",
    step: 2,
    color: "purple",
    description:
      "Licensed appraiser confirms the property value aligns with the purchase price.",
  },
  {
    key: "LOAN_CONTINGENCY",
    label: "Loan Contingency",
    shortLabel: "Loan",
    step: 3,
    color: "orange",
    description:
      "Final loan approval by the underwriter — all outstanding conditions are met.",
  },
  {
    key: "CLOSE_OF_ESCROW",
    label: "Close of Escrow",
    shortLabel: "Close",
    step: 4,
    color: "green",
    description:
      "Time to celebrate! Review and sign closing documents to complete the transaction.",
  },
] as const;

export type StageKey =
  | "DUE_DILIGENCE"
  | "APPRAISAL"
  | "LOAN_CONTINGENCY"
  | "CLOSE_OF_ESCROW";

export function getStageIndex(stage: string): number {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return idx === -1 ? 0 : idx;
}

export function getStageInfo(stage: string) {
  return STAGES.find((s) => s.key === stage) ?? STAGES[0];
}
