const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Format token harus Bearer"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token kosong"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      });
    }

    return res.status(401).json({
      message: "Token tidak valid"
    });
  }
};

module.exports = auth;