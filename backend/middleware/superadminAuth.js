const superadminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Ensure only Superadmin can access
  if (req.user.role !== "Superadmin") {
    return res.status(403).json({ message: "Akses ditolak: Hanya Superadmin" });
  }

  next();
};

module.exports = superadminAuth;
