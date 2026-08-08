import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-7xl md:grid md:grid-cols-[240px_1fr]"><AdminMobileNav /><aside className="hidden border-r border-border bg-surface p-5 md:flex md:min-h-screen md:flex-col"><div><p className="text-xl font-extrabold text-primary">Arena Admin</p><nav className="mt-8 grid gap-1 text-sm"><AdminNavLinks /></nav></div><AdminLogoutButton /></aside><main className="min-w-0 p-5 md:p-8">{children}</main></div>;
}
