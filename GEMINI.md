# PANDUAN PROYEK E-COMMERCE MGCCTV

Kamu adalah asisten pengembang untuk proyek E-Commerce MGCCTV. 
Setiap kali menerima perintah terkait database atau backend, selalu patuhi aturan berikut:

## ATURAN UTAMA
1. **Teknologi Backend:** Node.js, Express.js.
2. **Teknologi Database:** MySQL (Raw SQL menggunakan library `mysql2/promise`). **JANGAN menggunakan ORM** seperti Sequelize atau Prisma.
3. **Pembayaran:** Sistem menggunakan Midtrans Snap API (`midtrans-client`).
4. **Pengiriman:** Abaikan sama sekali logika API kurir (seperti RajaOngkir). Sistem tidak mengurus pengiriman pihak ketiga.
5. Jika diminta membuat query, selalu gunakan `try-catch` dan parameterisasi query (`?`) untuk mencegah SQL Injection.

---

## STRUKTUR DATABASE (SCHEMA)

Berikut adalah struktur lengkap dari database MySQL proyek ini:

### 1. ms_users (Master Data Pengguna)
- `id_users` (INT, Primary Key)
- `nama` (VARCHAR 50)
- `username` (VARCHAR 50)
- `password` (VARCHAR 64)
- `email` (VARCHAR 50)
- `no_hp` (VARCHAR 15)
- `alamat` (VARCHAR 255)
- `google_id` (VARCHAR 512)
- `role` (ENUM: 'Superadmin', 'Admin', 'Pelanggan')
- `password_updated_at` (DATETIME)
- `last_login` (DATETIME)
- `updated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `status` (ENUM: 'Aktif', 'Nonaktif')

### 2. ms_kategori (Master Data Kategori)
- `id_kategori` (INT, Primary Key)
- `nama_kategori` (VARCHAR 20)
- `updated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### 3. ms_produk (Master Data Produk)
- `id_produk` (INT, Primary Key)
- `nama_produk` (VARCHAR 150)
- `deskripsi_produk` (VARCHAR 512)
- `gambar_produk` (VARCHAR 255)
- `harga_produk` (INT)
- `stok` (INT)
- `updated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `status_produk` (TINYINT)
- `ms_kategori_id_kategori` (INT, Foreign Key ke ms_kategori)
- `is_unggulan` (TINYINT 1)

### 4. tr_transaksi (Tabel Utama Pemesanan & Pembayaran)
- `id_transaksi` (INT, Primary Key)
- `tanggal_transaksi` (DATETIME)
- `total_harga` (INT)
- `metode_bayar` (ENUM: 'transfer_bank', 'qris')
- `status_bayar` (ENUM: 'pending', 'paid', 'failed', 'expired') -> *Penting untuk sinkronisasi webhook Midtrans*
- `url_bayar` (VARCHAR 255) -> *Gunakan untuk menyimpan Token Snap Midtrans*
- `gateway_trx_id` (VARCHAR 255) -> *Gunakan untuk ID dari Midtrans jika perlu*
- `status_order` (ENUM: 'pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan')
- `updated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `id_users` (INT, Foreign Key ke ms_users)

### 5. tr_detail_transaksi (Item yang Dibeli dalam Transaksi)
- `id_detail_transaction` (INT, Primary Key)
- `id_produk` (INT, Foreign Key ke ms_produk)
- `quantity` (INT)
- `harga` (INT)
- `total` (INT)
- `updated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `id_transaksi` (INT, Foreign Key ke tr_transaksi)

### 6. tr_keranjang_item (Keranjang Belanja)
- `id_keranjang_item` (INT, Primary Key)
- `id_users` (INT, Foreign Key ke ms_users)
- `id_produk` (INT, Foreign Key ke ms_produk)
- `quantity` (INT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 7. tr_notifikasi (Notifikasi Sistem ke User)
- `id_notifikasi` (INT, Primary Key)
- `id_users` (INT, Foreign Key ke ms_users)
- `id_transaksi` (INT, Foreign Key ke tr_transaksi)
- `tipe` (ENUM: 'transaksi', 'pembayaran', 'status_order')
- `judul` (VARCHAR 100)
- `pesan` (TEXT)
- `link_tujuan` (VARCHAR 150)
- `is_read` (TINYINT 1)
- `created_at` (TIMESTAMP)

### 8. tr_cms_konten & tr_cms_galleries (Manajemen Tampilan Web)
- Digunakan untuk mengatur section landing page (section_name, content_value, url_gambar).