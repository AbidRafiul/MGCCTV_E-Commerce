const NotificationModel = require("../models/NotificationModel");

const fetchMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await NotificationModel.getNotificationsByUserId(userId);
    const unreadCount = await NotificationModel.getUnreadCount(userId);

    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetchMyNotifications:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const readNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const idNotifikasi = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!idNotifikasi) {
      return res.status(400).json({ message: "ID Notifikasi diperlukan" });
    }

    await NotificationModel.markAsRead(idNotifikasi, userId);

    res.status(200).json({ message: "Notifikasi telah dibaca" });
  } catch (error) {
    console.error("Error readNotification:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await NotificationModel.markAllAsRead(userId);

    res.status(200).json({ message: "Semua notifikasi telah dibaca" });
  } catch (error) {
    console.error("Error readAllNotifications:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  fetchMyNotifications,
  readNotification,
  readAllNotifications
};
