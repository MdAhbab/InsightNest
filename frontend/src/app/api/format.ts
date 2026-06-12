// Shared formatting helpers (WP-2)

/** Map backend application status to display label */
export type AppStatus =
  | "PENDING"
  | "APPROVED"
  | "NEEDS_INFO"
  | "REJECTED"
  | "WITHDRAWN"
  | string;

export function statusLabel(status: AppStatus): string {
  switch (status) {
    case "PENDING":    return "UNDER REVIEW";
    case "APPROVED":   return "ACCEPTED";
    case "NEEDS_INFO": return "NEEDS INFO";
    case "REJECTED":   return "REJECTED";
    case "WITHDRAWN":  return "WITHDRAWN";
    default:           return status ?? "—";
  }
}

/**
 * Format ISO date string to display style "2026.08.01".
 * Safe in Safari (avoids `new Date("2026.08.01")` which is invalid).
 */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  // Already in display format (e.g. from mock data)
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(iso)) return iso;
  try {
    // Parse ISO 8601: "2026-08-01" or "2026-08-01T00:00:00Z"
    const [datePart] = iso.split("T");
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[0]}.${parts[1].padStart(2, "0")}.${parts[2].padStart(2, "0")}`;
    }
    // Fallback: try Date constructor
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  } catch {
    return iso;
  }
}

/**
 * Format a monetary amount with currency code.
 * Guards null/undefined currency and amount.
 */
export function fmtMoney(
  amount: number | null | undefined,
  currency: string | null | undefined
): string {
  if (amount == null) return "—";
  if (!currency) return amount.toLocaleString("en-US");
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}
