const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  fetchMyNotifications,
  readNotification,
  readAllNotifications
} = require("../controllers/notificationController");

// Mengambil list notifikasi dan jumlah yang belum dibaca
router.get("/", auth, fetchMyNotifications);

// Tandai semua notifikasi menjadi sudah dibaca
// Rute ini harus didefinisikan SEBELUM rute /:id/read agar tidak dianggap sebagai parameter ID "read-all"
router.put("/read-all", auth, readAllNotifications);

// Tandai satu notifikasi tertentu menjadi sudah dibaca
router.put("/:id/read", auth, readNotification);

module.exports = router;
