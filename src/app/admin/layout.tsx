import type { ReactNode } from "react";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-7xl md:grid md:grid-cols-[240px_1fr]"><aside className="flex border-r border-border bg-surface p-5 md:min-h-screen md:flex-col"><div><p className="text-xl font-extrabold text-primary">Arena Admin</p><nav className="mt-8 grid gap-3 text-sm"><Link href="/admin">Dashboard</Link><Link href="/admin/bookings">Booking</Link><Link href="/admin/courts">Lapangan</Link><Link href="/admin/schedules">Jadwal</Link><Link href="/admin/payments">Pembayaran</Link><Link href="/admin/promos">Promo</Link><Link href="/admin/settings">Pengaturan</Link></nav></div><AdminLogoutButton /></aside><main className="min-w-0 p-5 md:p-8">{children}</main></div>;
}
