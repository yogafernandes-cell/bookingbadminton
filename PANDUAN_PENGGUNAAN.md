# Panduan Penggunaan Booking Lapangan

Panduan ini menjelaskan penggunaan sistem dari sisi pelanggan/member dan admin/staff. Sistem saat ini memakai pembayaran transfer manual: pelanggan transfer lalu mengunggah bukti pembayaran, kemudian admin memverifikasinya.

## Untuk pelanggan dan member

### 1. Melihat jadwal dan membuat booking

1. Buka halaman utama website.
2. Pilih tanggal bermain. Tanggal yang dipilih akan langsung membuka halaman jadwal.
3. Pilih lapangan, lalu tekan satu atau beberapa slot jam yang masih tersedia.
4. Periksa ringkasan booking di bagian bawah/samping: tanggal, lapangan, sesi, dan total biaya.
5. Tekan **Lanjutkan**.
6. Isi nama dan nomor WhatsApp aktif. Isi kode promo bila tersedia.
7. Kirim booking. Sistem akan membuat kode booking dan menahan slot sementara sesuai batas waktu pembayaran yang ditentukan arena.

Catatan:

- Satu transaksi hanya untuk satu lapangan, tetapi bisa memilih beberapa jam sekaligus.
- Slot yang berstatus penuh, diblokir, atau sedang ditahan pelanggan lain tidak bisa dipilih.
- Harga dapat berbeda berdasarkan hari dan jam. Total akhir di ringkasan booking adalah harga yang berlaku untuk slot tersebut.

### 2. Membayar dan upload bukti transfer

1. Setelah booking berhasil, buka halaman detail booking dari kode/link yang diberikan.
2. Transfer sesuai nominal dan rekening yang tampil di halaman.
3. Isi nama pengirim dan nominal transfer.
4. Unggah bukti pembayaran dalam format gambar.
5. Tekan kirim.

Status akan berubah menjadi **menunggu verifikasi admin**. Booking dinyatakan aman setelah admin memverifikasi pembayaran.

### 3. Cek status booking

1. Buka menu **Riwayat** atau halaman **Cek Booking**.
2. Masukkan kode booking dan nomor WhatsApp yang digunakan saat memesan.
3. Sistem menampilkan jadwal, status booking, dan status pembayaran.

### 4. Daftar dan login member

1. Buka menu **Akun** lalu pilih **Daftar Member**.
2. Isi nama, email, nomor WhatsApp, dan password.
3. Setelah terdaftar, login melalui menu **Akun**.
4. Member dapat melihat riwayat booking dari akun mereka.

Pelanggan tetap dapat membuat booking tanpa akun member.

## Untuk admin dan staff

### 1. Login admin

1. Buka `https://domain-anda/admin/login`.
2. Masukkan username/email dan password admin atau staff.
3. Setelah login, halaman dashboard admin akan terbuka.

Gunakan menu samping (atau tombol menu di HP). Menu yang aktif diberi warna hijau agar mudah diketahui.

### 2. Pengaturan awal arena

Masuk ke **Pengaturan** dan lengkapi:

- Nama arena atau bisnis.
- Alamat/lokasi arena.
- Nomor WhatsApp admin.
- Nama bank, nomor rekening, dan nama pemilik rekening.
- Batas waktu pembayaran untuk booking online.

Data ini akan tampil pada proses booking dan pembayaran pelanggan.

### 3. Mengelola lapangan

Masuk ke **Lapangan** untuk:

- Menambah lapangan baru.
- Mengubah nama, jenis lantai, deskripsi, dan harga dasar per jam.
- Upload foto lapangan dari HP/laptop (JPG, PNG, atau WebP, maksimal 5 MB).
- Menonaktifkan lapangan bila sedang tidak bisa digunakan.

Lapangan nonaktif tidak dapat dipesan pelanggan.

### 4. Mengatur jam operasional dan blokir jadwal

Masuk ke **Jadwal** untuk:

- Menentukan arena buka/tutup per hari.
- Menandai hari tertentu sebagai tutup.
- Mengatur slot untuk maintenance atau kebutuhan internal.

Pilih jam tutup **24:00** bila arena beroperasi sampai tengah malam. Setelah jam operasional diubah, pilihan jam booking online dan booking manual akan menyesuaikan.

### 5. Mengatur harga fleksibel

Masuk ke **Harga** untuk membuat tarif khusus berdasarkan:

- Lapangan.
- Hari tertentu atau semua hari.
- Rentang jam.
- Harga per jam.

Contoh: Lapangan 1 setiap Sabtu pukul 18:00–22:00 seharga Rp80.000/jam. Di luar aturan khusus tersebut, sistem memakai harga dasar lapangan.

### 6. Mencatat booking manual / walk-in

Masuk ke **Booking Manual** untuk pesanan lewat WhatsApp, telepon, atau pelanggan yang datang langsung.

1. Isi nama dan nomor WhatsApp pelanggan.
2. Pilih lapangan, tanggal, serta satu atau beberapa jam bermain.
3. Pilih status pembayaran: **Lunas**, **DP**, atau **Belum bayar**.
4. Tekan **Simpan & Chat WhatsApp**.

Slot langsung terkunci agar tidak dapat dibooking dari website. Sistem juga membuka WhatsApp dengan pesan konfirmasi yang siap dikirim.

### 7. Memeriksa booking, membatalkan, dan reschedule

Masuk ke **Booking**, lalu buka salah satu detail booking.

- Tekan **Kirim Konfirmasi WhatsApp** untuk membuka chat pelanggan dengan template konfirmasi.
- Tekan **Jadwalkan ulang** untuk memilih tanggal dan satu/lebih jam baru. Sistem mengecek jam operasional dan bentrok jadwal.
- Tekan **Batalkan booking** bila pesanan dibatalkan. Slot akan kembali tersedia.

Sebelum membatalkan atau mengubah jadwal booking yang sudah lunas, pastikan kebijakan refund/selisih harga sudah disepakati dengan pelanggan.

### 8. Verifikasi pembayaran transfer

1. Masuk ke **Pembayaran**.
2. Periksa bukti transfer, nama pengirim, dan nominal.
3. Terima pembayaran bila data sesuai; booking menjadi terkonfirmasi.
4. Tolak bila tidak sesuai dan sertakan alasan bila diminta sistem.

Jangan mengonfirmasi booking hanya dari chat WhatsApp tanpa mengecek mutasi/bukti transfer.

### 9. Mengelola promo dan member

- **Promo**: buat kode promo, periode aktif, diskon persen atau nominal, minimal transaksi, dan batas diskon bila perlu.
- **Member**: lihat data member dan riwayat booking mereka.

### 10. Melihat laporan

Masuk ke **Laporan** untuk melihat:

- Pendapatan hari ini.
- Pendapatan minggu ini.
- Pendapatan bulan ini.
- Daftar pembayaran terverifikasi terbaru.

Laporan hanya menghitung pembayaran yang sudah diverifikasi admin, sehingga tidak mencampur booking belum bayar atau bukti transfer yang masih diperiksa.

## Alur operasional yang disarankan

1. Atur lapangan, rekening, jam operasional, dan harga terlebih dahulu.
2. Cek menu pembayaran secara rutin dan verifikasi transaksi masuk.
3. Gunakan booking manual untuk pesanan WhatsApp/walk-in agar jadwal online selalu sinkron.
4. Kirim konfirmasi WhatsApp setelah booking dibuat atau pembayaran diverifikasi.
5. Cek laporan pendapatan setiap akhir hari dan bulan.

## Batasan sistem saat ini

- Pembayaran belum memakai payment gateway otomatis; verifikasi transfer masih dilakukan admin.
- Tombol WhatsApp membuka chat dengan pesan siap kirim, belum mengirim pesan otomatis.
- Refund dan kebijakan no-show perlu ditetapkan sendiri oleh pengelola arena.
