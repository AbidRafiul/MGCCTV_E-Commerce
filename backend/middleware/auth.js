const jwt = require("jsonwebtoken");
const connection = require("../config/database");

const auth = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET belum diset");
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak valid",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await connection.query(
      "SELECT id_users FROM ms_users WHERE id_users = ?",
      [decoded.id]
    );

    if (user.length === 0) {
      return res.status(401).json({
        message: "User tidak ditemukan",
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Token tidak valid",
    });
  }
};

module.exports = auth;