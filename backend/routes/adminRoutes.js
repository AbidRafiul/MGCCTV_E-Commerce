const express = require("express");
const router = express.Router();

const { 
  getAllUsers, 
  addAdmin, 
  updateAdmin, 
  deleteAdmin 
} = require("../controllers/admin/userController");
const { getDashboardStats } = require("../controllers/admin/dashboardController");

const auth = require("../middleware/auth");
const superadminAuth = require("../middleware/superadminAuth");
const { getAllProduk } = require("../controllers/admin/produkController");
// 1. GLOBAL MIDDLEWARE: Pastikan semua yang masuk sini sudah login (Admin & Superadmin)
router.use(auth);

// (Akses: Admin & Superadmin)
router.get("/dashboard", getDashboardStats);
router.get("/produk", getAllProduk);

// (Akses: HANYA Superadmin)
router.get("/users", superadminAuth, getAllUsers);
router.post("/users", superadminAuth, addAdmin);
router.put("/users/:id", superadminAuth, updateAdmin);
router.delete("/users/:id", superadminAuth, deleteAdmin);

module.exports = router;