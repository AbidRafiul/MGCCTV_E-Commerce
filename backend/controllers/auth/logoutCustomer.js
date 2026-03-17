const logoutCustomer = async (req, res) => {

  try {

    res.json({
      message: "Logout berhasil"
    });

  } catch (error) {

    res.status(500).json(error);

  }

};

module.exports = logoutCustomer;