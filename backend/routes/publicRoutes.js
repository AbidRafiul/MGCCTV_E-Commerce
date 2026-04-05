// routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const { getAllProduk, getProdukById } = require("../controllers/admin/produkController");
const { getAllKategori } = require("../controllers/admin/kategoriController");

// ETALASE TOKO: Bebas akses untuk siapa saja
router.get("/produk", getAllProduk);
router.get("/kategori", getAllKategori);
router.get("/produk/:id", getProdukById);

module.exports = router;    