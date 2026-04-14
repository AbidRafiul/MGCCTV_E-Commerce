const snap = require('../config/midtrans');

const createPaymentToken = async (req, res) => {
  try {
    const { totalAmount, customerDetails } = req.body;

    // Pastikan order_id SELALU BARU setiap kali klik (pakai timestamp)
    const orderId = `MG-${Date.now()}`; 

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: customerDetails.nama,
        email: customerDetails.email,
        phone: customerDetails.no_hp,
      },
      // Kita coba matikan dulu item_details untuk ngetes koneksi inti
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("Transaksi Berhasil Dibuat:", transaction.token);
    res.status(200).json({ token: transaction.token });

  } catch (error) {
    // Ini buat liat error detail di terminal
    console.error("DITOLAK MIDTRANS:", error.ApiResponse ? error.ApiResponse : error);
    res.status(500).json({ message: "Gagal memproses pembayaran", error: error.message });
  }
};

module.exports = { createPaymentToken };