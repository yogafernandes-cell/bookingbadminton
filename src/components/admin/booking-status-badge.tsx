const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "Menunggu pembayaran", className: "bg-warning/15 text-warning" },
  PAYMENT_REVIEW: { label: "Menunggu verifikasi", className: "bg-warning/15 text-warning" },
  CONFIRMED: { label: "Terkonfirmasi", className: "bg-primary/15 text-primary" },
  REJECTED: { label: "Ditolak", className: "bg-danger/15 text-red-300" },
  EXPIRED: { label: "Kedaluwarsa", className: "bg-surface-high text-muted" },
  CANCELLED: { label: "Dibatalkan", className: "bg-danger/15 text-red-300" },
  COMPLETED: { label: "Selesai", className: "bg-surface-high text-muted" },
  UNPAID: { label: "Belum dibayar", className: "bg-surface-high text-muted" },
  SUBMITTED: { label: "Dikirim", className: "bg-warning/15 text-warning" },
  VERIFIED: { label: "Terverifikasi", className: "bg-primary/15 text-primary" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const item = statusStyles[status] ?? { label: status, className: "bg-surface-high text-muted" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}>{item.label}</span>;
}
