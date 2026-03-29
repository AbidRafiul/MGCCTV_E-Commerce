    const connection = require("../../config/database");
    const cloudinary = require("cloudinary").v2;

    // ==========================================
    // 1. KONFIGURASI CLOUDINARY
    // ==========================================
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // HELPER: Fungsi untuk mengambil Public ID dari URL Cloudinary
    // Ini berguna agar kita bisa menghapus gambar spesifik di Cloudinary
    const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split("/");
        const filename = parts[parts.length - 1].split(".")[0]; 
        const folder = parts[parts.length - 2];
        return `${folder}/${filename}`;
    } catch (error) {
        return null;
    }
    };

    // ==========================================
    // 2. FUNGSI GET (Ambil Semua Produk)
    // ==========================================
    const getAllProduk = async (req, res) => {
    try {
        const query = `
        SELECT p.*, k.nama_kategori AS merek 
        FROM ms_produk p
        LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
        ORDER BY p.created_at DESC
        `;
        const [produk] = await connection.query(query);
        res.status(200).json(produk);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data produk", error: error.message });
    }
    };

    // ==========================================
    // 3. FUNGSI POST (Tambah Produk & Upload Gambar)
    // ==========================================
    const addProduk = async (req, res) => {
    try {
        const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = req.body;
        let imageUrl = "";

        if (req.file) {
        const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: "mgcctv_produk" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
            );
            stream.end(req.file.buffer);
        });

        const result = await uploadPromise;
        imageUrl = result.secure_url;
        }

        const query = `
        INSERT INTO ms_produk 
        (nama_produk, deskripsi_produk, gambar_produk, harga_produk, stok, status_produk, ms_kategori_id_kategori, created_at) 
        VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
        `;
        const values = [nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori];

        const [insertResult] = await connection.query(query, values);

        res.status(201).json({
        message: "Produk dan gambar berhasil disimpan!",
        id_produk: insertResult.insertId,
        gambar_url: imageUrl
        });

    } catch (error) {
        console.error("Error Add Produk:", error);
        res.status(500).json({ message: "Gagal menambahkan produk", error: error.message });
    }
    };

    // ==========================================
    // 4. FUNGSI GET 1 PRODUK (Untuk mengisi form Edit)
    // ==========================================
    const getProdukById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Query baru: Menggabungkan tabel produk dan kategori
        const query = `
            SELECT p.*, k.nama_kategori AS merek, k.nama_kategori AS nama_kategori
            FROM ms_produk p
            LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
            WHERE p.id_produk = ?
        `;
        
        const [produk] = await connection.query(query, [id]);
        
        if (produk.length === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }
        
        res.status(200).json(produk[0]);
    } catch (error) {
        console.error("Error GetProdukById:", error); // Biar gampang ngecek kalau ada error
        res.status(500).json({ message: "Gagal mengambil produk", error: error.message });
    }
    };
    
    // ==========================================
    // 5. FUNGSI PUT (Edit Produk & Ganti Gambar)
    // ==========================================
    const updateProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = req.body;
        
        // Cek produk lama di database
        const [oldProduct] = await connection.query("SELECT gambar_produk FROM ms_produk WHERE id_produk = ?", [id]);
        if (oldProduct.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });

        let imageUrl = oldProduct[0].gambar_produk; // Default: pakai gambar lama

        // JIKA ADA GAMBAR BARU YANG DI-UPLOAD
        if (req.file) {
        // a. Hapus gambar lama dari Cloudinary (jika ada)
        if (imageUrl && imageUrl.includes("cloudinary")) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        // b. Upload gambar baru ke Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: "mgcctv_produk" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
            );
            stream.end(req.file.buffer);
        });
        const result = await uploadPromise;
        imageUrl = result.secure_url;
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Update MySQL
        const query = `
        UPDATE ms_produk 
        SET nama_produk=?, deskripsi_produk=?, gambar_produk=?, harga_produk=?, stok=?, ms_kategori_id_kategori=?, updated_at=? 
        WHERE id_produk=?
        `;
        await connection.query(query, [nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori, now, id]);

        res.status(200).json({ message: "Produk berhasil diperbarui!", gambar_url: imageUrl });
    } catch (error) {
        console.error("Error Update Produk:", error);
        res.status(500).json({ message: "Gagal memperbarui produk", error: error.message });
    }
    };

    // ==========================================
    // 6. FUNGSI DELETE (Hapus Produk & Gambar Cloudinary)
    // ==========================================
    const deleteProduk = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek produk di database
        const [produk] = await connection.query("SELECT gambar_produk FROM ms_produk WHERE id_produk = ?", [id]);
        if (produk.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });

        const imageUrl = produk[0].gambar_produk;

        // Hapus gambar fisik dari Cloudinary (jika ada)
        if (imageUrl && imageUrl.includes("cloudinary")) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        // Hapus data dari MySQL
        await connection.query("DELETE FROM ms_produk WHERE id_produk = ?", [id]);

        res.status(200).json({ message: "Produk dan gambar berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete Produk:", error);
        res.status(500).json({ message: "Gagal menghapus produk", error: error.message });
    }
    };

    // ==========================================
    // 7. FUNGSI PATCH (Update Status Saja)
    // ==========================================
    const updateStatusProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_produk } = req.body; // Menerima angka 0 atau 1 dari frontend
        
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await connection.query(
        "UPDATE ms_produk SET status_produk = ?, updated_at = ? WHERE id_produk = ?",
        [status_produk, now, id]
        );

        res.status(200).json({ message: "Status produk berhasil diperbarui!" });
    } catch (error) {
        console.error("Error Update Status:", error);
        res.status(500).json({ message: "Gagal memperbarui status", error: error.message });
    }
    };

    // Export semua fungsi
module.exports = { getAllProduk, addProduk, getProdukById, updateProduk, deleteProduk, updateStatusProduk };