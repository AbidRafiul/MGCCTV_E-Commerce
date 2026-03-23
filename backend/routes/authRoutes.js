const express = require("express");
const router = express.Router();

const{ROLE} = require("../utils/role");

const loginUsers = require("../controllers/auth/loginUsers");
const registerCustomer = require("../controllers/auth/registerCustomer");
const googleLogin = require("../controllers/auth/googleLogin");
const profileUsers = require("../controllers/auth/profileUsers");
const ubahPassword = require("../controllers/auth/ubahPassword");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/login", loginUsers);
router.post("/register", registerCustomer);
router.post("/google", googleLogin);
router.get("/profile", auth, profileUsers);
router.put("/profile", auth, profileUsers);
router.patch("/profile", auth, profileUsers);
router.put("/ubah-password", auth, ubahPassword);


//Menggunakan konstanta untuk validasi role
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