import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Copy, Landmark, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { PaymentCountdown } from "@/components/customer/payment-countdown";
import { PaymentProofForm } from "@/components/customer/payment-proof-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function BookingDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [booking, settings] = await Promise.all([
    db.booking.findUnique({ where: { code }, include: { items: { include: { court: true }, orderBy: { startsAt: "asc" } }, payments: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    db.setting.findUnique({ where: { id: 1 } }),
  ]);
  if (!booking || booking.items.length === 0) notFound();
  const first = booking.items[0];
  const last = booking.items.at(-1)!;
  const whatsappMessage = encodeURIComponent(`Halo Admin, saya ingin konfirmasi booking ${booking.code}.`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:py-10">
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border p-6 text-center sm:p-8"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><CheckCircle2 className="size-9" /></span><p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-primary">Booking dibuat</p><h1 className="mt-2 text-3xl font-extrabold">Selesaikan pembayaran</h1><p className="mx-auto mt-2 max-w-lg text-muted">Jadwal sedang ditahan. Transfer sesuai nominal lalu upload bukti pembayaran.</p></div>
        <div className="grid gap-6 p-5 sm:p-8">
          <div className="rounded-lg border border-border bg-background/45 p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><span className="text-sm font-bold text-muted">Kode booking</span><strong className="text-2xl tracking-widest text-primary">{booking.code}</strong></div><div className="mt-4 grid gap-3 text-sm"><p className="flex gap-3"><Landmark className="mt-0.5 size-5 shrink-0 text-primary" /><span><strong className="block text-base">{first.court.name}</strong><span className="text-muted">{first.court.floorType}</span></span></p><p className="flex items-center gap-3"><CalendarDays className="size-5 text-primary" /><span className="capitalize">{format(first.startsAt, "EEEE, d MMMM yyyy", { locale: id })}</span></p><p className="flex items-center gap-3"><Clock3 className="size-5 text-primary" />{format(first.startsAt, "HH:mm")}–{format(last.endsAt, "HH:mm")} WIB ({booking.items.length} jam)</p></div><div className="mt-5 flex items-end justify-between border-t border-border pt-4"><span className="text-sm font-bold text-muted">Total pembayaran</span><strong className="text-2xl">{rupiah.format(Number(booking.totalAmount))}</strong></div></div>

          {booking.status === "PENDING_PAYMENT" ? <PaymentCountdown dueAt={booking.paymentDueAt.toISOString()} initialStatus={booking.status} /> : null}
          {booking.status === "PAYMENT_REVIEW" ? <div className="rounded-lg border-l-4 border-warning bg-warning/10 p-5 text-center"><Clock3 className="mx-auto size-8 text-warning" /><h2 className="mt-2 text-xl font-bold">Menunggu verifikasi admin</h2><p className="mt-1 text-sm text-muted">Bukti pembayaran sudah diterima dan jadwal Anda telah diamankan.</p></div> : null}
          {booking.status === "CONFIRMED" ? <div className="rounded-lg border-l-4 border-primary bg-primary/10 p-5 text-center"><CheckCircle2 className="mx-auto size-8 text-primary" /><h2 className="mt-2 text-xl font-bold">Booking terkonfirmasi</h2><p className="mt-1 text-sm text-muted">Pembayaran telah diverifikasi. Sampai bertemu di lapangan!</p></div> : null}
          {booking.status === "REJECTED" ? <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-5"><div className="flex gap-3"><AlertTriangle className="size-6 shrink-0 text-red-300" /><div><h2 className="font-bold">Bukti pembayaran ditolak</h2><p className="mt-1 text-sm text-muted">{booking.payments[0]?.rejectionReason ?? "Periksa kembali bukti pembayaran dan upload ulang."}</p></div></div></div> : null}
          {booking.status === "EXPIRED" ? <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-5 text-center"><AlertTriangle className="mx-auto size-8 text-red-300" /><h2 className="mt-2 text-xl font-bold">Booking kedaluwarsa</h2><p className="mt-1 text-sm text-muted">Batas pembayaran telah habis dan slot sudah dilepas kembali.</p></div> : null}

          {booking.status === "PENDING_PAYMENT" || booking.status === "REJECTED" ? <div className="rounded-lg border border-border p-5"><p className="text-xs font-bold uppercase tracking-widest text-muted">Transfer bank</p><h2 className="mt-2 text-xl font-bold">{settings?.bankName ?? "Rekening belum diatur"}</h2><p className="mt-1 text-sm text-muted">a.n. {settings?.bankAccountHolder ?? "Arena Badminton"}</p><div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-background p-4"><strong className="text-xl tracking-wider">{settings?.bankAccountNumber ?? "-"}</strong><Copy className="size-5 text-primary" /></div><p className="mt-3 text-xs leading-5 text-muted">Transfer tepat sesuai total pembayaran agar verifikasi lebih mudah.</p></div> : null}

          {booking.status === "PENDING_PAYMENT" || booking.status === "REJECTED" ? <PaymentProofForm code={booking.code} amount={Number(booking.totalAmount)} /> : null}
          <a href={`https://wa.me/${settings?.adminWhatsapp ?? ""}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-5 py-3.5 font-bold text-foreground hover:border-primary"><MessageCircle className="size-5" />Hubungi admin</a>
        </div>
      </section>
    </div>
  );
}
