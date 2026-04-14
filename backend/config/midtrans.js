const midtransClient = require('midtrans-client');
require('dotenv').config();

// Kita pakai sistem Fallback (Kalau .env gagal, dia otomatis pakai kunci yang ditaruh langsung)
const serverKeyMidtrans = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-kJHSMwp_QtxrqPS0VnsVzB_-";

// Pasang CCTV buat ngecek kuncinya masuk atau nggak
console.log("==========================================");
console.log("KUNCI MIDTRANS YANG DIPAKAI:", serverKeyMidtrans);
console.log("==========================================");

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // Langsung kita paksa 'false' (Sandbox) biar nggak error
  serverKey: serverKeyMidtrans,
});

module.exports = snap;