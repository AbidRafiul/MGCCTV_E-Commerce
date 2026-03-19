const express = require("express");
const router = express.Router();

const { 
  getAllUsers, 
  addAdmin, 
  updateAdmin, 
  deleteAdmin 
} = require("../controllers/admin/userController");

const auth = require("../middleware/auth");
const superadminAuth = require("../middleware/superadminAuth");

// Protect all admin routes with auth and superadminAuth
router.use(auth);
router.use(superadminAuth);

router.get("/users", getAllUsers);
router.post("/users", addAdmin);
router.put("/users/:id", updateAdmin);
router.delete("/users/:id", deleteAdmin);

module.exports = router;
