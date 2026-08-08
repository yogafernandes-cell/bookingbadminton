import { BookingLookup } from "@/components/customer/booking-lookup";

export default function CheckBookingPage() {
  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Riwayat pelanggan</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Cek status booking</h1><p className="mx-auto mt-3 max-w-xl text-muted">Masukkan kode booking dan nomor WhatsApp yang digunakan saat memesan.</p></div><BookingLookup /></div>;
}
