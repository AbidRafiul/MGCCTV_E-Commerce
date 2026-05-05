const connection = require("../config/database");

const NotificationModel = {
  getNotificationsByUserId: async (userId, role) => {
    let query;
    let params;
    
    // Periksa apakah user adalah Admin atau Superadmin (case-insensitive aman)
    if (role && ['admin', 'superadmin'].includes(role.toLowerCase())) {
      // Ambil notifikasi untuk admin (bisa berupa id_users admin itu sendiri, atau id_users NULL untuk broadcast sistem)
      query = "SELECT * FROM tr_notifikasi WHERE id_users = ? OR id_users IS NULL ORDER BY created_at DESC LIMIT 50";
      params = [userId];
    } else {
      // User biasa hanya melihat notifikasi miliknya sendiri
      query = "SELECT * FROM tr_notifikasi WHERE id_users = ? ORDER BY created_at DESC LIMIT 20";
      params = [userId];
    }
    
    const [rows] = await connection.query(query, params);
    return rows;
  },

  getUnreadCount: async (userId, role) => {
    let query;
    let params;
    
    if (role && ['admin', 'superadmin'].includes(role.toLowerCase())) {
      query = "SELECT COUNT(*) as unreadCount FROM tr_notifikasi WHERE (id_users = ? OR id_users IS NULL) AND is_read = 0";
      params = [userId];
    } else {
      query = "SELECT COUNT(*) as unreadCount FROM tr_notifikasi WHERE id_users = ? AND is_read = 0";
      params = [userId];
    }
    
    const [rows] = await connection.query(query, params);
    return rows[0].unreadCount;
  },

  markAsRead: async (idNotifikasi, userId) => {
    const [result] = await connection.query(
      "UPDATE tr_notifikasi SET is_read = 1 WHERE id_notifikasi = ? AND id_users = ?",
      [idNotifikasi, userId]
    );
    return result;
  },

  markAllAsRead: async (userId) => {
    const [result] = await connection.query(
      "UPDATE tr_notifikasi SET is_read = 1 WHERE id_users = ? AND is_read = 0",
      [userId]
    );
    return result;
  },

  createNotification: async (id_users, id_transaksi, tipe, judul, pesan) => {
    const [result] = await connection.query(
      "INSERT INTO tr_notifikasi (id_users, id_transaksi, tipe, judul, pesan) VALUES (?, ?, ?, ?, ?)",
      [id_users, id_transaksi, tipe, judul, pesan]
    );
    return result;
  },

  broadcastToAdmins: async (idTransaksi, tipe, judul, pesan, linkTujuan) => {
    // Ambil semua admin atau superadmin
    const [admins] = await connection.query(
      "SELECT id_users FROM ms_users WHERE role IN ('Admin', 'Superadmin')"
    );

    if (admins.length > 0) {
      let query = "INSERT INTO tr_notifikasi (id_users, id_transaksi, tipe, judul, pesan, link_tujuan, is_read, created_at) VALUES ";
      const placeholders = admins.map(() => "(?, ?, ?, ?, ?, ?, 0, NOW())").join(", ");
      query += placeholders;
      
      const flatValues = admins.reduce((acc, admin) => {
        return acc.concat([admin.id_users, idTransaksi, tipe, judul, pesan, linkTujuan]);
      }, []);

      const [result] = await connection.query(query, flatValues);
      return result;
    }
    return null;
  }
};

module.exports = NotificationModel;
