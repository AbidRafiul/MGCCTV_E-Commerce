const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Customer Auth Running");
});

// route auth
app.use("/api/auth", authRoutes);

// route admin
app.use("/api/admin", adminRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});