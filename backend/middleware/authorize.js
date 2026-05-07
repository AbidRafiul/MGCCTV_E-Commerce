const authorize = (...roles) => {
  return (req, res, next) => {
    // Samakan format role agar "Admin", "admin", atau variasi casing lain tetap terbaca.
    const userRole = String(req.user?.role || "").toLowerCase();
    const allowedRoles = roles.map((role) => String(role).toLowerCase());

    // Middleware ini dipakai setelah auth untuk membatasi akses berdasarkan role user.
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Akses ditolak"
      });
    }

    next();
  };
};

module.exports = authorize;
