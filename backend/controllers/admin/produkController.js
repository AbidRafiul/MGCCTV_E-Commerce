const connection = require("../../config/database");

const getAllProduk = async (req, res) => {
    try {
    // Join tabel ms_produk dengan ms_kategori untuk mengambil nama merek
    const query = `
    SELECT 
        p.id_produk, 
        p.nama_produk, 
        p.deskripsi_produk, 
        p.gambar_produk, 
        p.harga_produk, 
        p.stok, 
        p.status_produk,
        k.nama_kategori AS merek 
        FROM ms_produk p
        LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
        ORDER BY p.created_at DESC
    `;
    
    const [produk] = await connection.query(query);
    res.status(200).json(produk);
} catch (error) {
    console.error("Error Get Produk:", error);
    res.status(500).json({ message: "Gagal mengambil data produk", error: error.message });
}
};

module.exports = { getAllProduk };