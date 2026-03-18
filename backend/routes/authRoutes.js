const express = require("express");
const router = express.Router();

const loginUsers = require("../controllers/auth/loginUsers");
const registerCustomer = require("../controllers/auth/registerCustomer");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/login", loginUsers);
router.post("/register", registerCustomer);

// hanya customer
router.get("/customer", auth, authorize("customer"), (req,res)=>{
  res.json({message:"halaman customer"});
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