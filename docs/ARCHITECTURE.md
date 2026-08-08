# Arsitektur MVP

Modular monolith berbasis Next.js App Router. `src/app` hanya menangani route dan layout, `src/modules` memuat aturan per domain, `src/components` memuat UI reusable, dan `src/lib` menjadi adapter layanan eksternal.

## Infrastruktur

- Vercel: web app, route handlers, cron.
- Supabase: hosted PostgreSQL.
- Supabase Storage: private bucket bukti pembayaran dan public bucket foto lapangan.
- Sentry: error dan performance monitoring.
- Domain sendiri: diarahkan ke deployment Vercel.

## Route

- `/`, `/jadwal`, `/booking`, `/booking/[code]`, `/cek-booking`: pelanggan.
- `/admin/*`: dashboard yang dilindungi session admin.
- `/api/auth/*`: autentikasi admin.
- `/api/health`: health check deployment.
- `/api/cron/expire-bookings`: melepas hold yang kedaluwarsa, dipanggil Vercel Cron.

## Aturan penting

Harga dan ketersediaan selalu dihitung ulang di server. Pembuatan booking harus memakai transaksi database dan constraint unik slot. Booking berstatus hold dianggap kedaluwarsa berdasarkan waktu server, bukan countdown browser.
