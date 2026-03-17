const express = require("express");
const router = express.Router();

const registerCustomer = require("../controllers/auth/registerCustomer");
const loginUsers = require("../controllers/auth/loginUsers");
const logoutCustomer = require("../controllers/auth/logoutCustomer");
const auth = require("../middleware/auth");

router.post("/register", registerCustomer);
router.post("/login", loginUsers);
router.post("/logout", auth, logoutCustomer);

module.exports = router;