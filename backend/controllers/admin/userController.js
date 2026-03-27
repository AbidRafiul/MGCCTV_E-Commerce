const connection = require("../../config/database");
const bcrypt = require("bcrypt");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let query = "SELECT id_users, nama, username, email, no_hp, alamat, role, status, created_at FROM ms_users WHERE 1=1";
    const params = [];

    if (role && role !== "Semua Role") {
      query += " AND role = ?";
      params.push(role);
    }
    
    if (status && status !== "Semua Status") {
      query += " AND status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (nama LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const [users] = await connection.query(query, params);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new Admin
const addAdmin = async (req, res) => {
  try {
    const { nama, username, email, password, no_hp, alamat, role, status } = req.body;

    // Check existing
    const [existing] = await connection.query(
      "SELECT id_users FROM ms_users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email atau username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalRole = role || "Admin"; // Default Admin for this form
    const finalStatus = status || "Aktif";

    await connection.query(
      `INSERT INTO ms_users 
      (nama, username, password, email, no_hp, alamat, role, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nama, username, hashedPassword, email, no_hp, alamat, finalRole, finalStatus]
    );

    res.status(201).json({ message: "Admin berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, username, email, no_hp, alamat, role, status, password } = req.body;

    const [existing] = await connection.query("SELECT id_users FROM ms_users WHERE id_users = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    let query = "UPDATE ms_users SET nama=?, username=?, email=?, no_hp=?, alamat=?, role=?, status=?";
    const params = [nama, username, email, no_hp, alamat, role, status];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password=?";
      params.push(hashedPassword);
    }

    query += " WHERE id_users=?";
    params.push(id);

    await connection.query(query, params);

    res.json({ message: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await connection.query("SELECT id_users, role FROM ms_users WHERE id_users = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const targetRole = existing[0].role?.toLowerCase();
    const currentUserId = req.user?.id || req.user?.id_users;

    if (targetRole === "superadmin" && currentUserId === parseInt(id)) {
      return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" });
    }

    // Eksekusi Hapus Permanen
    try {
      await connection.query("DELETE FROM ms_users WHERE id_users = ?", [id]);
      return res.json({ message: "User berhasil dihapus permanen" });
      
    } catch (dbError) {
      // Tangkap error 1451 (Terhalang Foreign Key Constraint)
      if (dbError.errno === 1451) {
        // Berikan pesan yang jelas ke frontend (Admin)
        return res.status(400).json({ 
          message: "Gagal dihapus: User ini memiliki riwayat pesanan. Silakan ubah statusnya menjadi Nonaktif melalui menu Edit." 
        });
      }
      // Jika errornya bukan karena transaksi, lempar ke catch utama di bawah
      throw dbError; 
    }

  } catch (error) {
    console.error("Error Delete User:", error);
    res.status(500).json({ message: "Gagal memproses penghapusan", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  addAdmin,
  updateAdmin,
  deleteAdmin
};
