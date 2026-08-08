# Arena Badminton Booking

Skeleton MVP booking lapangan badminton dengan transfer manual dan upload bukti pembayaran.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local` dan isi kredensial Supabase Database, Supabase Storage, Auth.js, dan Sentry.
2. Jalankan `npm run db:generate` (`DIRECT_URL` digunakan Prisma CLI, `DATABASE_URL` digunakan aplikasi).
3. Jalankan `npm run db:migrate` setelah database Supabase tersedia.
4. Jalankan `npm run db:seed` untuk membuat admin awal.
5. Jalankan `npm run dev`.

Admin seed default adalah `admin@arena.local`. Atur `SEED_ADMIN_PASSWORD` sebelum seed dan segera ubah kredensial default pada lingkungan production.

Lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) untuk struktur sistem.
