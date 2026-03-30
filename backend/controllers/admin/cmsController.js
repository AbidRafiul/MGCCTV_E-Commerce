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

    // 2. Simpan ke Database (Perhatikan: kolom deskripsi dihilangkan jika tidak ada di DB aslimu)
    const query = `INSERT INTO tr_cms_galleries (section_name, url_gambar) VALUES (?, ?)`;
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

    // Jika admin mengupload gambar baru (Biasanya untuk foto utama Tentang Kami)
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'CMS_Tentang');
      url_gambar = result.secure_url;
    }

    // Jika ID belum ada, INSERT. Jika sudah ada, UPDATE.
    // Tapi karena ini CMS, biasanya kita UPDATE baris yang sudah ada.
    const [check] = await connection.query("SELECT id_cms_konten FROM tr_cms_konten WHERE id_cms_konten = ?", [id]);
    
    if (check.length === 0) {
       // Insert jika belum ada
       const query = `INSERT INTO tr_cms_konten (id_cms_konten, section_name, content_value, url_gambar) VALUES (?, ?, ?, ?)`;
       await connection.query(query, [id, section_name, content_value, url_gambar]);
    } else {
       // Update jika sudah ada
       // Jika url_gambar bernilai null (admin tidak upload file baru), jangan timpa URL gambar lama menjadi null
       if (url_gambar) {
         const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ?, url_gambar = ? WHERE id_cms_konten = ?`;
         await connection.query(query, [section_name, content_value, url_gambar, id]);
       } else {
         const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ? WHERE id_cms_konten = ?`;
         await connection.query(query, [section_name, content_value, id]);
       }
    }
    
    res.json({ message: "Konten Tentang Kami berhasil diupdate!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal update konten", error });
  }
};