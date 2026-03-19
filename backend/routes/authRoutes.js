const express = require("express");
const router = express.Router();

const loginUsers = require("../controllers/auth/loginUsers");
const registerCustomer = require("../controllers/auth/registerCustomer")
const googleLogin = require("../controllers/auth/googleLogin");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/login", loginUsers);
router.post("/register", registerCustomer)
router.post("/google", googleLogin);

// hanya customer
router.get("/kustomer", auth, authorize("kustomer"), (req,res)=>{
  res.json({message:"halaman kustomer"});
});

// hanya admin
router.get("/admin", auth, authorize("admin"), (req,res)=>{
  res.json({message:"halaman admin"});
});

// hanya superadmin
router.get("/superadmin", auth, authorize("superadmin"), (req,res)=>{
  res.json({message:"halaman superadmin"});
});

module.exports = router;