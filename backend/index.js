require("dotenv").config({ path: `${__dirname}/.env` });
const express = require("express");
const cors = require("cors");

const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const pembelianRoutes = require('./routes/pembelianRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("CEK SERVER KEY:", process.env.MIDTRANS_SERVER_KEY);

app.get("/", (req, res) => {
  res.send("API Customer Auth Running");
});

//route public
app.use("/api/public", publicRoutes);

// route auth
app.use("/api/auth", authRoutes);

// route admin
app.use("/api/admin", adminRoutes);

// route pembelian
app.use('/api/pembelian', pembelianRoutes);

// route transaksi
app.use("/api/transaksi", transaksiRoutes);



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
