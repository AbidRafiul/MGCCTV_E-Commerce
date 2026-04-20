const express = require('express');
const router = express.Router();

// PASTIKAN BARIS INI HANYA MEMANGGIL pembelianController, BUKAN laporanController
const { getListProduk, tambahStok } = require('../controllers/admin/pembelianController');

// Import penjaga (auth)
const auth = require('../middleware/auth'); 

// Rute asli pembelian
router.get('/list', getListProduk);
router.post('/tambah', auth, tambahStok);

module.exports = router;