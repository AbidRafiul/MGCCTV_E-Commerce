const express = require("express");
const router = express.Router();

const transaksiController = require("../controllers/transaksiController");
const auth = require("../middleware/auth");

// Endpoint untuk membuat transaksi Midtrans
router.post("/", auth, transaksiController.createMidtransTransaction);

// Endpoint untuk webhook Midtrans (TIDAK MENGGUNAKAN auth)
router.post("/midtrans-webhook", transaksiController.midtransWebhook);

module.exports = router;
