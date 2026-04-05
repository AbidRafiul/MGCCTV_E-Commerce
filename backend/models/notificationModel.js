const connection = require("../config/database");

const NotificationModel = {
getByUserId: async (id_users) => {
    const [rows] = await connection.query(
      "SELECT * FROM tr_notifikasi WHERE id_users = ? ORDER BY created_at DESC LIMIT 20",
      [id_users]
    );
    return rows;
  },

  // Tandai semua notifikasi user menjadi sudah dibaca
  markAllAsRead: async (id_users) => {
    const [result] = await connection.query(
      "UPDATE tr_notifikasi SET is_read = 1 WHERE id_users = ? AND is_read = 0",
      [id_users]
    );
    return result;
  },

  // Fungsi ini nanti kamu pakai di proses Checkout/Admin untuk membuat notif baru
  createNotification: async (id_users, tipe, judul, pesan, link_tujuan = null) => {
    const [result] = await connection.query(
      "INSERT INTO tr_notifikasi (id_users, tipe, judul, pesan, link_tujuan, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [id_users, tipe, judul, pesan, link_tujuan]
    );
    return result;
  }
};

module.exports = NotificationModel;