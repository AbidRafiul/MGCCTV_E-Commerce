const midtransClient = require('midtrans-client');
const db = require('../config/database'); // Pastikan path ini sesuai dengan konfigurasi database mysql2/promise Anda

const createMidtransTransaction = async (req, res) => {
    try {
        const { id_users, total_harga, items } = req.body;

        // Validasi input
        if (!id_users || !total_harga) {
            return res.status(400).json({ 
                success: false, 
                message: 'id_users dan total_harga wajib diisi' 
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Data items (barang) wajib diisi dan berupa array'
            });
        }

        // 0.5. Cek ketersediaan stok untuk semua barang
        for (const item of items) {
            const { id_produk, quantity } = item;
            const checkStockQuery = `SELECT stok FROM ms_produk WHERE id_produk = ?`;
            const [stockResult] = await db.execute(checkStockQuery, [id_produk]);

            if (stockResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Produk dengan ID ${id_produk} tidak ditemukan`
                });
            }

            const currentStock = stockResult[0].stok;
            if (currentStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Stok barang tidak mencukupi'
                });
            }
        }

        // 1. Insert data awal ke tr_transaksi dengan status 'pending'
        const insertQuery = `
            INSERT INTO tr_transaksi (id_users, total_harga, status_bayar, tanggal_transaksi)
            VALUES (?, ?, 'pending', NOW())
        `;
        const [insertResult] = await db.execute(insertQuery, [id_users, total_harga]);
        const insertId = insertResult.insertId;

        // 1.5. Insert detail barang ke tr_detail_transaksi
        const insertDetailQuery = `
            INSERT INTO tr_detail_transaksi (id_transaksi, id_produk, quantity, harga, total)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const item of items) {
            const { id_produk, quantity, harga } = item;
            const total = quantity * harga;
            // Gunakan parameter query agar aman dari SQL Injection
            await db.execute(insertDetailQuery, [insertId, id_produk, quantity, harga, total]);

            // Update stok barang di tabel ms_produk (mengurangi stok)
            const updateStockQuery = `
                UPDATE ms_produk
                SET stok = stok - ?
                WHERE id_produk = ?
            `;
            await db.execute(updateStockQuery, [quantity, id_produk]);
        }

        // 2. Buat order_id dengan prefix
        const order_id = `MGCCTV-${insertId}`;

        // 3. Inisialisasi Midtrans Snap (DI-MOCK SEMENTARA)
        // Pastikan MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY sudah ada di .env
        
        const snap = new midtransClient.Snap({
            isProduction: false, // Ubah ke true jika sudah live production
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY
        });
        

        // 4. Request createTransaction ke Midtrans (DI-MOCK SEMENTARA)
        // Catatan: gross_amount wajib berupa angka bulat (integer)
        
        const parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: Math.round(total_harga) 
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
/*
        // --- MOCK TRANSACTION RESPONSE ---
        const transaction = { 
            token: 'mock-token-xyz-123', 
            redirect_url: 'https://sandbox.midtrans.com/mock-payment-page' 
        };
        // ---------------------------------
        */
        // Midtrans mengembalikan 'token' dan 'redirect_url'
        const token = transaction.token;
        const redirect_url = transaction.redirect_url;

        // 5. UPDATE data tr_transaksi yang barusan dibuat
        // Menyimpan redirect_url ke url_bayar dan token ke gateway_trx_id
        const updateQuery = `
            UPDATE tr_transaksi
            SET url_bayar = ?, gateway_trx_id = ?
            WHERE id_transaksi = ?
        `;
        await db.execute(updateQuery, [redirect_url, token, insertId]);

        // 6. Return response JSON ke frontend
        return res.status(200).json({
            success: true,
            message: 'Transaksi berhasil dibuat (MOCK)',
            token: token,
            redirect_url: redirect_url,
            order_id: order_id
        });

    } catch (error) {
        console.error('Error createMidtransTransaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses transaksi Midtrans',
            error: error.message
        });
    }
};

const midtransWebhook = async (req, res) => {
    try {
        const { order_id, transaction_status, fraud_status } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        // Mendapatkan kembali id_transaksi (mengambil angka setelah "MGCCTV-")
        const id_transaksi = order_id.replace('MGCCTV-', '');

        let status_bayar = 'pending';

        // Logika penentuan status_bayar berdasarkan response Midtrans
        if (transaction_status === 'capture') {
            if (fraud_status === 'accept') {
                status_bayar = 'paid';
            } else {
                status_bayar = 'pending';
            }
        } else if (transaction_status === 'settlement') {
            status_bayar = 'paid';
        } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
            status_bayar = 'failed';
        } else if (transaction_status === 'expire') {
            status_bayar = 'expired';
        } else if (transaction_status === 'pending') {
            status_bayar = 'pending';
        }

        // Update database tr_transaksi
        const updateQuery = `
            UPDATE tr_transaksi
            SET status_bayar = ?
            WHERE id_transaksi = ?
        `;
        await db.execute(updateQuery, [status_bayar, id_transaksi]);

        // Response statis HTTP 200 agar Midtrans berhenti mengirim ulang webhook (Notifikasi berhasil diterima)
        return res.status(200).json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error('Error midtransWebhook:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error saat memproses webhook',
            error: error.message
        });
    }
};

module.exports = {
    createMidtransTransaction,
    midtransWebhook
};
