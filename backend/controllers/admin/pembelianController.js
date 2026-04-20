const db = require('../../config/database');

// API 1: Mengambil list produk untuk Dropdown di Frontend
const getListProduk = async (req, res) => {
  try {
    const [results] = await db.query("SELECT id_produk, nama_produk, stok, harga_produk FROM ms_produk");
    res.status(200).json(results);
  } catch (err) {
    console.error("Error getListProduk:", err.message);
    res.status(500).json({ error: "Gagal mengambil daftar produk" });
  }
};

// API 2: Tambah Stok (Restock) dengan Proteksi Role & Histori
const tambahStok = async (req, res) => {
  const id_user = req.user.id; 
  
  // 1. CUKUP AMBIL 2 INI SAJA DARI FRONTEND 👇 (tanggal_masuk dihapus dari sini)
  const { id_produk, jumlah_masuk } = req.body;

  try {
    const [userData] = await db.query("SELECT role FROM ms_users WHERE id_users = ?", [id_user]);
    
    if (userData.length === 0) return res.status(404).json({ error: "User tidak ditemukan." });

    const roleUser = userData[0].role?.toLowerCase();

    if (roleUser !== 'admin' && roleUser !== 'superadmin') {
      return res.status(403).json({ error: "Akses Ditolak! Hanya Admin/Superadmin yang bisa menambah stok." });
    }

    // 2. KUNCI OTOMATISNYA: Panggil NOW() langsung di dalam query SQL 👇
    await db.query(
      "INSERT INTO tr_pembelian (id_produk, id_user, jumlah_masuk, tanggal_masuk) VALUES (?, ?, ?, NOW())",
      [id_produk, id_user, jumlah_masuk] // <-- Array-nya juga cuma sisa 3
    );

    // Update stok fisik di tabel ms_produk (Tetap sama)
    await db.query(
      "UPDATE ms_produk SET stok = stok + ? WHERE id_produk = ?",
      [Number(jumlah_masuk), id_produk]
    );

    return res.status(200).json({ message: "Berhasil! Stok telah diperbarui dan tanggal otomatis tercatat." });

  } catch (error) {
    console.error("❌ Terjadi Error:", error.message);
    return res.status(500).json({ error: "Gagal memproses restock", detail: error.message });
  }
};

module.exports = { getListProduk, tambahStok };