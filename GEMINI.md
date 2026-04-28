# MGCCTV E-Commerce Database Schema (`db_mgcctv`)
Dokumen ini adalah *Knowledge Base* mutlak untuk arsitektur database MGCCTV. Gunakan dokumen ini sebagai referensi utama saat membuat Query SQL, Model MVC, logika bisnis, atau relasi antar data.

---

## 1. Modul Autentikasi & Pengguna (User Management)

### Tabel: `ms_users`
**Deskripsi:** Tabel sentral untuk menyimpan profil pengguna. Sistem menggunakan *Role-Based Access Control* (RBAC) membedakan pelanggan biasa dan admin.
- `id_users` : `INT` (PK, Auto Increment) -> ID unik pengguna.
- `nama` : `VARCHAR(50)` -> Nama lengkap pengguna.
- `username` : `VARCHAR(50)` -> Nama panggilan/username (harus unik).
- `password` : `VARCHAR(64)` -> Password yang sudah di-hash (bcrypt). Berisi "-" jika login via Google.
- `email` : `VARCHAR(50)` -> Alamat email (harus unik, digunakan untuk login dan notifikasi).
- `no_hp` : `VARCHAR(15)` -> Nomor kontak/WhatsApp.
- `alamat` : `VARCHAR(255)` -> Alamat pengiriman utama pelanggan.
- `google_id` : `VARCHAR(512)` -> Menyimpan ID unik Google jika pengguna mendaftar via SSO Google. Nullable.
- `role` : `ENUM('Superadmin', 'Admin', 'Pelanggan')` -> Menentukan hak akses. 'Pelanggan' hanya bisa belanja, 'Admin/Superadmin' bisa mengakses dashboard toko.
- `password_updated_at` : `DATETIME` -> Kapan terakhir kali pengguna mengganti sandi.
- `last_login` : `DATETIME` -> Waktu login terakhir untuk melacak keaktifan pengguna.
- `status` : `ENUM('Aktif', 'Nonaktif')` -> Untuk keperluan *soft-delete* atau *banned user*.
- `created_at` / `updated_at` : `TIMESTAMP`

### Tabel: `tr_otp` (Jika diterapkan dari fitur Lupa Sandi)
**Deskripsi:** Tabel sementara untuk menyimpan kode OTP reset password.
- `id` : `INT` (PK, Auto Increment)
- `email` : `VARCHAR(50)` -> Email yang meminta reset sandi.
- `otp_code` : `VARCHAR(6)` -> Kode 6 digit angka acak.
- `expired_at` : `DATETIME` -> Batas waktu kode OTP hangus (biasanya 5 menit setelah dibuat).
- `created_at` : `TIMESTAMP`

---

## 2. Modul Katalog Produk (Product Catalog)

### Tabel: `ms_kategori`
**Deskripsi:** Kategori pengelompokan produk (misal: "Kamera Indoor", "Kamera Outdoor", "DVR", "Aksesoris").
- `id_kategori` : `INT` (PK, Auto Increment)
- `nama_kategori` : `VARCHAR(20)` -> Nama kategori produk.
- `created_at` / `updated_at` : `TIMESTAMP`

### Tabel: `ms_produk`
**Deskripsi:** Katalog barang yang dijual di MGCCTV.
- `id_produk` : `INT` (PK, Auto Increment)
- `ms_kategori_id_kategori` : `INT` (FK) -> Relasi ke tabel `ms_kategori`.
- `nama_produk` : `VARCHAR(150)`
- `deskripsi_produk` : `VARCHAR(512)` -> Penjelasan detail spesifikasi CCTV.
- `gambar_produk` : `VARCHAR(255)` -> URL/Path ke file gambar produk.
- `harga_produk` : `INT` -> Harga jual dalam Rupiah (Rp).
- `stok` : `INT` -> Jumlah barang fisik yang tersedia. Otomatis berkurang saat transaksi (checkout) terjadi.
- `is_unggulan` : `TINYINT(1)` -> Flag boolean (1=Ya, 0=Tidak) untuk menampilkan produk di *section* "Produk Terlaris/Unggulan" di Homepage.
- `status_produk` : `TINYINT` -> Status visibilitas (1=Tampil/Aktif, 0=Disembunyikan).
- `created_at` / `updated_at` : `TIMESTAMP`

---

## 3. Modul Transaksi & Pembayaran (Order Management)

### Tabel: `tr_keranjang_item`
**Deskripsi:** Menyimpan *shopping cart* (keranjang belanja) pengguna yang belum dibayar.
- `id_keranjang_item` : `INT` (PK, Auto Increment)
- `id_users` : `INT` (FK) -> Milik siapa keranjang ini.
- `id_produk` : `INT` (FK) -> Barang apa yang dimasukkan.
- `quantity` : `INT` -> Berapa banyak barang tersebut ingin dibeli.
- `created_at` / `updated_at` : `TIMESTAMP`

### Tabel: `tr_transaksi`
**Deskripsi:** Tabel Header (Nota Utama) saat pengguna melakukan *checkout*. Di sinilah integrasi Payment Gateway (Midtrans) dicatat.
- `id_transaksi` : `INT` (PK, Auto Increment)
- `id_users` : `INT` (FK) -> Siapa pembelinya.
- `tanggal_transaksi` : `DATETIME`
- `total_harga` : `INT` -> Grand total pembayaran dalam Rupiah.
- `metode_bayar` : `ENUM('transfer_bank', 'qris')`
- `status_bayar` : `ENUM('pending', 'paid', 'failed', 'expired')` -> Dikelola otomatis oleh Webhook Midtrans.
- `url_bayar` : `VARCHAR(255)` -> Link *redirect* halaman pembayaran Midtrans (Snap URL).
- `gateway_trx_id` : `VARCHAR(255)` -> Token Snap Midtrans atau ID Transaksi dari gateway.
- `status_order` : `ENUM('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan')` -> Status pengiriman fisik barang, diubah manual oleh Admin MGCCTV.
- `created_at` / `updated_at` : `TIMESTAMP`

### Tabel: `tr_detail_transaksi`
**Deskripsi:** Tabel Item/Rincian dari Nota Transaksi. Memecah `tr_transaksi` menjadi baris-baris barang apa saja yang dibeli.
- `id_detail_transcation` : `INT` (PK, Auto Increment)
- `id_transaksi` : `INT` (FK) -> Merujuk ke Nota Transaksi mana.
- `id_produk` : `INT` (FK) -> Produk apa yang dibeli.
- `quantity` : `INT` -> Jumlah yang dibeli.
- `harga` : `INT` -> Harga satuan produk *pada saat itu* (mencegah perubahan harga jika `ms_produk` di-update di masa depan).
- `total` : `INT` -> Hasil dari `quantity` * `harga`.
- `created_at` / `updated_at` : `TIMESTAMP`

---

## 4. Modul Interaksi & CMS

### Tabel: `tr_notifikasi`
**Deskripsi:** Sistem lonceng notifikasi *real-time* berbasis *database*. Mendukung logika notifikasi personal (Pelanggan) dan logika *Broadcast* (Admin).
- `id_notifikasi` : `INT` (PK, Auto Increment)
- `id_users` : `INT` (FK) -> Kepada siapa notifikasi ini ditujukan.
- `id_transaksi` : `INT` (FK, Nullable) -> Jika notifikasi berkaitan dengan pesanan (misal: "Pembayaran Sukses"), ini merujuk ke ID Pesanan tersebut.
- `tipe` : `ENUM('transaksi', 'pembayaran', 'status_order')` -> Kategori notifikasi untuk kebutuhan ikon/filter di UI.
- `judul` : `VARCHAR(100)` -> *Headline* notifikasi singkat.
- `pesan` : `TEXT` -> Isi detail pesan.
- `link_tujuan` : `VARCHAR(150)` -> Rute Next.js tempat pengguna akan diarahkan saat notifikasi diklik (contoh: `/admin/pesanan/12`).
- `is_read` : `TINYINT(1)` -> Boolean (0=Belum Dibaca/Menyala merah, 1=Sudah Dibaca).
- `created_at` : `TIMESTAMP`

### Tabel: `tr_cms_galleries`
**Deskripsi:** Untuk mengelola *carousel* atau galeri foto portofolio pemasangan CCTV MGCCTV di *frontend*.
- `id_cms_gallery` : `INT` (PK)
- `section_name` : `VARCHAR(45)` -> Mengelompokkan gambar (misal: "hero-banner", "portfolio").
- `url_gambar` : `VARCHAR(255)`
- `created_at` / `updated_at` : `TIMESTAMP`

### Tabel: `tr_cms_konten`
**Deskripsi:** Menyimpan teks dinamis untuk diubah Admin tanpa menyentuh *source code* React.
- `id_cms_konten` : `INT` (PK)
- `section_name` : `VARCHAR(45)` -> Penanda teks (misal: "tentang_kami_deskripsi", "alamat_toko").
- `content_value` : `VARCHAR(200)` -> Isi teksnya.
- `url_gambar` : `VARCHAR(255)` -> Gambar pendamping teks (opsional).
- `created_at` / `updated_at` : `TIMESTAMP`

---
**Instruksi Khusus untuk AI Assistant:**
Setiap kali diminta membuat logika yang beririsan dengan banyak tabel (contoh: *Checkout*), AI WAJIB mempertimbangkan alur:
1. Validasi `stok` di `ms_produk`.
2. Insert header ke `tr_transaksi`.
3. Loop insert ke `tr_detail_transaksi` dan `UPDATE` pengurangan stok `ms_produk`.
4. Kosongkan `tr_keranjang_item`.
5. Sisipkan `tr_notifikasi` untuk Pelanggan dan Broadcast ke Admin.