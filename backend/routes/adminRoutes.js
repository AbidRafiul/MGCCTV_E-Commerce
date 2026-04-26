const express = require("express");
const router = express.Router();

// ==========================================
// 1. IMPORT MIDDLEWARE
// ==========================================
const auth = require("../middleware/auth");
const superadminAuth = require("../middleware/superadminAuth");
const upload = require("../middleware/upload");
const cmsController = require("../controllers/admin/cmsController");
const orderController = require("../controllers/admin/orderController");
const { getTransactionReport } = require("../controllers/admin/reportController");
const { getProdukUnggulan, toggleUnggulan } = require("../controllers/admin/produkController");


// ==========================================
// 2. IMPORT CONTROLLERS
// ==========================================
const { getDashboardStats } = require("../controllers/admin/dashboardController");
const { getAllKategori, addKategori, updateKategori, deleteKategori } = require("../controllers/admin/kategoriController");
const { getAllUsers, addAdmin, updateAdmin, deleteAdmin } = require("../controllers/admin/userController");
const { getAllProduk, addProduk, getProdukById, updateProduk, deleteProduk, updateStatusProduk } = require("../controllers/admin/produkController");

// ==========================================
// 3. MIDDLEWARE HELPER
// ==========================================
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
// 4. DAFTAR ROUTES PUBLIK (Tidak perlu auth)
// ==========================================

// --- RUTE CMS TENTANG KAMI PUBLIK ---
router.get("/cms/tentang", cmsController.getTentangContent);
router.get("/cms/galeri", cmsController.getGallery);
router.get("/cms/unggulan", getProdukUnggulan);


// ==========================================
// 5. GLOBAL MIDDLEWARE: Auth Required
// ==========================================
// Semua rute di bawah baris ini wajib login
router.use(auth);


// --- RUTE DASHBOARD ---
router.get("/dashboard", getDashboardStats);

// --- RUTE KATEGORI (MEREK) ---
router.get("/kategori", getAllKategori);
router.post("/kategori", addKategori);
router.put("/kategori/:id", updateKategori);
router.delete("/kategori/:id", deleteKategori);

// --- RUTE PRODUK ---
// router.get("/produk", getAllProduk);
// router.get("/produk/:id", getProdukById);
router.post("/produk", handleUploadGambar, addProduk);
router.put("/produk/:id", handleUploadGambar, updateProduk);
router.patch("/produk/:id/status", updateStatusProduk);
router.delete("/produk/:id", deleteProduk);

// --- RUTE BERANDA (PRODUK UNGGULAN SAJA) ---
router.patch("/produk/:id/unggulan", toggleUnggulan);

// --- RUTE PESANAN ---
router.get("/pesanan", orderController.getAllOrders);
router.patch("/pesanan/:id/status", orderController.updateOrderStatus);
router.get("/laporan-transaksi", getTransactionReport);

// --- RUTE CMS TENTANG KAMI (UPDATE) ---
router.put("/cms/tentang/:id", handleUploadGambar, cmsController.updateTentangContent);

// --- RUTE CMS GALERI (ADD & DELETE) ---
router.post("/cms/galeri", handleUploadGambar, cmsController.addGallery);
router.delete("/cms/galeri/:id", cmsController.deleteGallery);

// --- RUTE PENGGUNA (HANYA SUPERADMIN) ---
router.get("/users", superadminAuth, getAllUsers);
router.post("/users", superadminAuth, addAdmin);
router.put("/users/:id", superadminAuth, updateAdmin);
router.delete("/users/:id", superadminAuth, deleteAdmin);


module.exports = router;
