"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/admin"], ["Booking", "/admin/bookings"], ["Booking Manual", "/admin/manual-bookings"],
  ["Member", "/admin/members"], ["Lapangan", "/admin/courts"], ["Harga", "/admin/pricing"],
  ["Jadwal", "/admin/schedules"], ["Pembayaran", "/admin/payments"], ["Laporan", "/admin/reports"],
  ["Promo", "/admin/promos"], ["Pengaturan", "/admin/settings"],
];

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <>{links.map(([label, href]) => {
    const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2.5 font-semibold transition ${active ? "bg-primary text-[#091422] shadow-sm" : "text-foreground hover:bg-surface-high hover:text-primary"}`}>{label}</Link>;
  })}</>;
}
