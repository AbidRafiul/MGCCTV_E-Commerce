const express = require("express");
const router = express.Router();

const{ROLE} = require("../utils/role");

const loginUsers = require("../controllers/auth/loginUsers");
const registerCustomer = require("../controllers/auth/registerCustomer");
const googleLogin = require("../controllers/auth/googleLogin");
const logoutCustomer = require("../controllers/auth/logoutCustomer");
const profileUsers = require("../controllers/auth/profileUsers");
const ubahPassword = require("../controllers/auth/ubahPassword");
const cartController = require("../controllers/auth/cartController");
const { forgotPassword, verifyOTP, resetPassword } = require("../controllers/auth/forgotPasswordController");
const orderHistoryController = require("../controllers/auth/orderHistoryController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/login", loginUsers);
router.post("/register", registerCustomer);
router.post("/google", googleLogin);
router.post("/logout", auth, logoutCustomer);
router.get("/profile", auth, profileUsers);
router.put("/profile", auth, profileUsers);
router.patch("/profile", auth, profileUsers);
router.put("/ubah-password", auth, ubahPassword);
router.get("/cart", auth, cartController.getCartItems);
router.get("/cart/count", auth, cartController.getCartCount);
router.get("/orders", auth, orderHistoryController.getOrderHistory);
router.post("/cart/items", auth, cartController.addCartItem);
router.patch("/cart/items/:productId", auth, cartController.updateCartItemQuantity);
router.delete("/cart/items/:productId", auth, cartController.removeCartItem);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

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
