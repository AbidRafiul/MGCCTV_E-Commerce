const connection = require('../../config/database'); 
const cloudinary = require('cloudinary').v2;

// Fungsi pembantu untuk melempar buffer memori ke Cloudinary
const uploadToCloudinary = (buffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `MGCCTV/${folderName}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// ==========================================
// 1. GALERI TENTANG KAMI (tr_cms_galleries)
// ==========================================
exports.getGallery = async (req, res) => {
  try {
    const [results] = await connection.query("SELECT * FROM tr_cms_galleries ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error server", error: err });
  }
};

exports.addGallery = async (req, res) => {
  const { section_name } = req.body; 

  if (!req.file) {
    return res.status(400).json({ message: "Gambar wajib diupload!" });
  }

  try {
    // 1. Upload ke Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'CMS_Galeri');
    const url_gambar = result.secure_url;

    // 2. Simpan ke Database (Ditambah created_at dan updated_at pakai NOW())
    const query = `INSERT INTO tr_cms_galleries (section_name, url_gambar, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    const [dbResult] = await connection.query(query, [section_name || 'Galeri', url_gambar]);
    
    res.status(201).json({ message: "Galeri berhasil ditambahkan", id: dbResult.insertId, url_gambar });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan galeri", error });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cari URL gambar di database
    const [results] = await connection.query("SELECT url_gambar FROM tr_cms_galleries WHERE id_cms_konten = ?", [id]);
    if (results.length === 0) return res.status(404).json({ message: "Galeri tidak ditemukan" });

    const imageUrl = results[0].url_gambar;
    
    // 2. Hapus dari Cloudinary
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.pop().split('.')[0]; 
    const folderPath = `MGCCTV/CMS_Galeri/${fileName}`;
    
    // Abaikan error jika foto di cloudinary sudah terhapus manual
    try {
       await cloudinary.uploader.destroy(folderPath);
    } catch(err) {
       console.log("Gambar Cloudinary tidak ditemukan, lanjut hapus di DB.");
    }

    // 3. Hapus dari database
    await connection.query("DELETE FROM tr_cms_galleries WHERE id_cms_konten = ?", [id]);
    res.json({ message: "Foto galeri berhasil dihapus!" });

  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus galeri", error });
  }
};

// ==========================================
// 2. KONTEN TENTANG KAMI (tr_cms_konten)
// ==========================================
exports.getTentangContent = async (req, res) => {
  try {
    const [results] = await connection.query("SELECT * FROM tr_cms_konten");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error server", error: err });
  }
};

exports.updateTentangContent = async (req, res) => {
  const { id } = req.params;
  const { section_name, content_value } = req.body;
  
  try {
    let url_gambar = req.body.url_gambar || null; 

    // Jika admin mengupload gambar baru
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'CMS_Tentang');
      url_gambar = result.secure_url;
    }

    // Cek apakah ID sudah ada di database
    const [check] = await connection.query("SELECT id_cms_konten FROM tr_cms_konten WHERE id_cms_konten = ?", [id]);
    
    if (check.length === 0) {
       // JIKA BELUM ADA (INSERT): Tambahkan NOW() untuk created_at dan updated_at
       const query = `INSERT INTO tr_cms_konten (id_cms_konten, section_name, content_value, url_gambar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
       await connection.query(query, [id, section_name, content_value, url_gambar]);
    } else {
       // JIKA SUDAH ADA (UPDATE): Tambahkan updated_at = NOW()
       if (url_gambar) {
         // Jika ada update gambar (atau URL embed map)
         const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ?, url_gambar = ?, updated_at = NOW() WHERE id_cms_konten = ?`;
         await connection.query(query, [section_name, content_value, url_gambar, id]);
       } else {
         // Jika hanya update teks (tanpa gambar)
         const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ?, updated_at = NOW() WHERE id_cms_konten = ?`;
         await connection.query(query, [section_name, content_value, id]);
       }
    }
    
    res.json({ message: "Konten Tentang Kami berhasil diupdate!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal update konten", error });
  }
};