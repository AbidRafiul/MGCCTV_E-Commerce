const express = require("express");
const router = express.Router();

// ==========================================
// 1. IMPORT MIDDLEWARE
// ==========================================
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const superadminAuth = require("../middleware/superadminAuth");
const upload = require("../middleware/upload");
const cmsController = require("../controllers/admin/cmsController");
const orderController = require("../controllers/admin/orderController");
const { getTransactionReport } = require("../controllers/admin/reportController");
const { getProdukUnggulan, toggleUnggulan } = require("../controllers/admin/produkController");
const supplierController = require("../controllers/admin/supplierController");


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

// Helper role untuk fitur yang hanya boleh dikelola Admin dan Superadmin.
const adminOrSuperadmin = authorize("Admin", "Superadmin");

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

// --- RUTE SUPPLIER (HANYA ADMIN & SUPERADMIN) ---
// getAllSupplier: mengambil semua data supplier dari tabel ms_supplier.
router.get("/supplier", adminOrSuperadmin, supplierController.getAllSupplier);

// getSupplierById: mengambil detail supplier berdasarkan id_supplier.
router.get("/supplier/:id", adminOrSuperadmin, supplierController.getSupplierById);

// createSupplier: menambahkan data supplier baru.
router.post("/supplier", adminOrSuperadmin, supplierController.createSupplier);

// updateSupplier: memperbarui data supplier berdasarkan id_supplier.
router.put("/supplier/:id", adminOrSuperadmin, supplierController.updateSupplier);

// deleteSupplier: menghapus data supplier berdasarkan id_supplier.
router.delete("/supplier/:id", adminOrSuperadmin, supplierController.deleteSupplier);

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
