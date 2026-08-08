import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/settings-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const settings = await db.setting.findUnique({ where: { id: 1 } });
  return <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Konfigurasi</p><h1 className="mt-2 text-3xl font-extrabold">Pengaturan arena</h1><p className="mt-2 max-w-2xl text-muted">Informasi ini tampil pada proses booking, pembayaran, dan kontak pelanggan.</p><SettingsForm initial={{ venueName: settings?.venueName ?? "Booking Lapangan", address: settings?.address ?? "", adminWhatsapp: settings?.adminWhatsapp ?? "", bankName: settings?.bankName ?? "", bankAccountNumber: settings?.bankAccountNumber ?? "", bankAccountHolder: settings?.bankAccountHolder ?? "", holdDurationMinutes: settings?.holdDurationMinutes ?? 15 }} /></div>;
}
