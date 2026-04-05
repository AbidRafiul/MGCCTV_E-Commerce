// routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const { getAllProduk, getProdukById } = require("../controllers/admin/produkController");
const { getAllKategori } = require("../controllers/admin/kategoriController");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const auth = require("../middleware/auth");

// ETALASE TOKO: Bebas akses untuk siapa saja
router.get("/produk", getAllProduk);
router.get("/kategori", getAllKategori);
router.get("/produk/:id", getProdukById);

<<<<<<< HEAD
module.exports = router;    
=======
// NOTIFIKASI: Login dibutuhkan
router.get("/notifications", auth, getNotifications);
router.put("/notifications/read", auth, markAsRead);
module.exports = router;
>>>>>>> main
