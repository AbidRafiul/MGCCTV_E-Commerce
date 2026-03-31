const UserModel = require("../../models/UserModel"); // Memanggil si Koki
const bcrypt = require("bcrypt");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    // Panggil Model untuk mengeksekusi DB
    const users = await UserModel.getAll(role, status, search); 
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new Admin
const addAdmin = async (req, res) => {
  try {
    const { nama, username, email, password, no_hp, alamat, role, status } = req.body;

    const existing = await UserModel.checkExisting(email, username);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email atau username sudah digunakan" });
    }

    // Controller hanya fokus pada urusan keamanan & logika (Bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalRole = role || "Admin"; 
    const finalStatus = status || "Aktif";

    // Lempar data matang ke Model untuk disimpan
    await UserModel.create({
      nama, username, hashedPassword, email, no_hp, alamat, finalRole, finalStatus
    });

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

    const existing = await UserModel.getById(id);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await UserModel.update(id, {
      nama, username, email, no_hp, alamat, role, status, hashedPassword
    });

    res.json({ message: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await UserModel.getById(id);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const targetRole = existing[0].role?.toLowerCase();
    const currentUserId = req.user?.id || req.user?.id_users;

    // Validasi pencegahan hapus diri sendiri (Logika Bisnis tetap di Controller)
    if (targetRole === "superadmin" && currentUserId === parseInt(id)) {
      return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" });
    }

    try {
      await UserModel.delete(id);
      return res.json({ message: "User berhasil dihapus permanen" });
    } catch (dbError) {
      if (dbError.errno === 1451) {
        return res.status(400).json({ 
          message: "Gagal dihapus: User ini memiliki riwayat pesanan. Silakan ubah statusnya menjadi Nonaktif melalui menu Edit." 
        });
      }
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