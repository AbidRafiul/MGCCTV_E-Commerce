const express = require('express');
const router = express.Router();

const {
  getListProduk,
  getPembelianOptions,
  getPembelianList,
  getPembelianDetail,
  createPembelian,
  addPembelianItems,
  deletePembelian,
  tambahStok,
} = require('../controllers/admin/pembelianController');

// Import penjaga (auth)
const auth = require('../middleware/auth'); 

// Rute pembelian barang untuk Admin/Superadmin.
router.get('/list', getListProduk);
router.get('/options', auth, getPembelianOptions);
router.get('/transaksi', auth, getPembelianList);
router.get('/:id', auth, getPembelianDetail);
router.post('/', auth, createPembelian);
router.post('/:id/items', auth, addPembelianItems);
router.delete('/:id', auth, deletePembelian);
router.post('/tambah', auth, tambahStok);

module.exports = router;
