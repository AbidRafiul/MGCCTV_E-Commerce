const express = require("express");
const router = express.Router();

// ==========================================
// 1. IMPORT MIDDLEWARE
// ==========================================
const auth = require("../middleware/auth");
const superadminAuth = require("../middleware/superadminAuth");
const upload = require("../middleware/upload");

// ==========================================
// 2. IMPORT CONTROLLERS
// ==========================================
const { getDashboardStats } = require("../controllers/admin/dashboardController");
const { getAllKategori, addKategori, updateKategori, deleteKategori } = require("../controllers/admin/kategoriController");
const { 
  getAllUsers, 
  addAdmin, 
  updateAdmin, 
  deleteAdmin 
} = require("../controllers/admin/userController");
const { 
  getAllProduk, 
  addProduk, 
  getProdukById, 
  updateProduk, 
  deleteProduk, 
  updateStatusProduk // <--- FIX: Fungsi sudah ditambahkan di sini!
} = require("../controllers/admin/produkController");

// ==========================================
// 3. MIDDLEWARE HELPER
// ==========================================
// Menyatukan penanganan error upload gambar agar tidak ditulis berulang-ulang
const handleUploadGambar = (req, res, next) => {
  upload.single("gambar")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: "Gagal mengunggah gambar. Pastikan ukuran file di bawah batas maksimal (2MB).", 
        error: err.message 
      });
    }
    next();
  });
};

// ==========================================
// 4. DAFTAR ROUTES
// ==========================================

// GLOBAL MIDDLEWARE: Pastikan semua yang masuk rute di bawah ini sudah login
router.use(auth);


// --- RUTE DASHBOARD ---
router.get("/dashboard", getDashboardStats);


// --- RUTE KATEGORI (MEREK) ---
router.get("/kategori", getAllKategori);
router.post("/kategori", addKategori);
router.put("/kategori/:id", updateKategori);
router.delete("/kategori/:id", deleteKategori);


// --- RUTE PRODUK ---
router.get("/produk", getAllProduk);
router.get("/produk/:id", getProdukById);
router.post("/produk", handleUploadGambar, addProduk);
router.put("/produk/:id", handleUploadGambar, updateProduk);
router.patch("/produk/:id/status", updateStatusProduk);
router.delete("/produk/:id", deleteProduk);


// --- RUTE PENGGUNA (HANYA SUPERADMIN) ---
router.get("/users", superadminAuth, getAllUsers);
router.post("/users", superadminAuth, addAdmin);
router.put("/users/:id", superadminAuth, updateAdmin);
router.delete("/users/:id", superadminAuth, deleteAdmin);


module.exports = router;