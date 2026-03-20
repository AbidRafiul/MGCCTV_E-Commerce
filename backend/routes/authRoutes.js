const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const{ROLE} = require("../utils/role");
=======
const { ROLE } = require("../utils/role"); // Tambahkan ini
>>>>>>> e94e6cf39d6fd65534166bb43add91957af03b3e

const loginUsers = require("../controllers/auth/loginUsers");
const registerCustomer = require("../controllers/auth/registerCustomer");
const googleLogin = require("../controllers/auth/googleLogin");
<<<<<<< HEAD
const profileUsers = require("../controllers/auth/profileUsers");
const ubahPassword = require("../controllers/auth/ubahPassword");

=======
>>>>>>> e94e6cf39d6fd65534166bb43add91957af03b3e
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/login", loginUsers);
router.post("/register", registerCustomer);
router.post("/google", googleLogin);
router.get("/profile", auth, profileUsers);
router.put("/profile", auth, profileUsers);
router.patch("/profile", auth, profileUsers);
router.put("/ubah-password", auth, ubahPassword);

<<<<<<< HEAD

//Menggunakan konstanta untuk validasi role
=======
// Menggunakan konstanta untuk validasi role
>>>>>>> e94e6cf39d6fd65534166bb43add91957af03b3e
router.get("/kustomer", auth, authorize(ROLE.KUSTOMER), (req, res) => {
  res.json({ message: "halaman kustomer" });
});

router.get("/admin", auth, authorize(ROLE.ADMIN), (req, res) => {
  res.json({ message: "halaman admin" });
});

router.get("/superadmin", auth, authorize(ROLE.SUPERADMIN), (req, res) => {
  res.json({ message: "halaman superadmin" });
});

module.exports = router;