const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: `${__dirname}/.env` });

const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Customer Auth Running");
});

//route public
app.use("/api/public", publicRoutes);

// route auth
app.use("/api/auth", authRoutes);

// route admin
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
