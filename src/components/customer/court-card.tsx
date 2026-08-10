import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

type CourtCardProps = {
  court: { id: string; name: string; floorType: string; location: string; hourlyRate: number; availableSlots: number; availabilityStatus: "AVAILABLE" | "FULL" | "CLOSED"; imageUrl: string; date?: string };
};

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function CourtCard({ court }: CourtCardProps) {
  const status = court.availabilityStatus === "AVAILABLE" ? "Tersedia" : court.availabilityStatus === "FULL" ? "Penuh" : "Tutup";
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-primary">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-high">
        <Image src={court.imageUrl} alt={`${court.name}, ${court.floorType}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
        <span className={`absolute right-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${court.availabilityStatus === "AVAILABLE" ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground"}`}><span className={`size-2 rounded-full ${court.availabilityStatus === "AVAILABLE" ? "bg-primary-foreground" : "bg-warning"}`} />{status}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="text-2xl font-bold">{court.name}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted"><Layers3 className="size-4 text-primary" />{court.floorType}</p><p className="mt-1 text-xs text-muted/80">{court.location}</p></div>
          <div className="text-right"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Per jam</p><p className="mt-1 whitespace-nowrap text-lg font-extrabold text-primary">{rupiah.format(court.hourlyRate)}</p></div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-sm font-bold text-muted">{court.availabilityStatus === "CLOSED" ? "Arena tutup" : <><span className="text-primary">{court.availableSlots}</span> sesi kosong</>}</p>
          <Link href={`/jadwal?court=${court.id}${court.date ? `&date=${court.date}` : ""}`} style={{ color: "#091422" }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold transition hover:brightness-110">Lihat Jadwal <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </article>
  );
}
