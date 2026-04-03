const logoutCustomer = async (req, res) => {
  return res.status(200).json({
    message: "Logout berhasil",
  });
};

module.exports = logoutCustomer;
