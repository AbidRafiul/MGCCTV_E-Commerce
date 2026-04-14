const express = require('express');
const router = express.Router();
const { createPaymentToken } = require('../controllers/paymentController');

router.post('/process', createPaymentToken);

module.exports = router;