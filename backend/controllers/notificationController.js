const NotificationModel = require("../models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    // req.user.id didapat dari middleware verifikasi JWT kamu
    const id_users = req.user.id; 
    const notifications = await NotificationModel.getByUserId(id_users);
    
    return res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error getNotifications:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil notifikasi" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const id_users = req.user.id;
    await NotificationModel.markAllAsRead(id_users);
    
    return res.json({ success: true, message: "Notifikasi ditandai dibaca" });
  } catch (error) {
    console.error("Error markAsRead:", error);
    return res.status(500).json({ success: false, message: "Gagal mengupdate notifikasi" });
  }
};

module.exports = { getNotifications, markAsRead };