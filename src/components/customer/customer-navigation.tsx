"use client";

import Link from "next/link";
import { CalendarDays, History, Search, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Cari", icon: Search },
  { href: "/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/cek-booking", label: "Riwayat", icon: History },
  { href: "/member", label: "Akun", icon: UserRound },
];

export function CustomerNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-3 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item, index) => {
          const active = index === 0 ? pathname === "/" : pathname.startsWith(item.href) && index < 3;
          const Icon = item.icon;
          return <Link key={`${item.label}-${index}`} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground" : "text-muted"}`}><Icon className="size-5" /><span>{item.label}</span></Link>;
        })}
      </div>
    </nav>
  );
}
