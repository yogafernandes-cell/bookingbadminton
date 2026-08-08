import type { ReactNode } from "react";
import Link from "next/link";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerNavigation } from "@/components/customer/customer-navigation";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <CustomerHeader />
      <main>{children}</main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted md:px-8"><p>© {new Date().getFullYear()} Booking Lapangan</p><Link href="/admin/login" className="mt-2 inline-block font-semibold text-muted/70 transition hover:text-primary">Staff</Link></footer>
      <CustomerNavigation />
    </div>
  );
}
