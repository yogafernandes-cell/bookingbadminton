import Link from "next/link";
import { CircleUserRound, Search } from "lucide-react";
import { db } from "@/lib/db";

export async function CustomerHeader() {
  const settings = await db.setting.findUnique({ where: { id: 1 }, select: { venueName: true } });
  const venueName = settings?.venueName ?? "Arena Badminton";
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Arena Badminton, beranda">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><span className="text-lg font-black">A</span></span>
          <span className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">{venueName}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <Link href="/" className="text-primary">Cari Lapangan</Link>
          <Link href="/jadwal" className="text-muted transition hover:text-foreground">Jadwal</Link>
          <Link href="/cek-booking" className="text-muted transition hover:text-foreground">Cek Booking</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/jadwal" aria-label="Cari jadwal" className="hidden size-10 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:border-primary hover:text-primary sm:grid"><Search className="size-5" /></Link>
          <Link href="/cek-booking" aria-label="Akun atau cek booking" className="grid size-10 place-items-center rounded-full bg-surface-high text-foreground"><CircleUserRound className="size-6" /></Link>
        </div>
      </div>
    </header>
  );
}
