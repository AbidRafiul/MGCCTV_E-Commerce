const userModel = require("../../models/userModel");

const handleUserError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers(req.query);
    return res.status(200).json(users);
  } catch (error) {
    return handleUserError(res, error, "Gagal mengambil data pengguna");
  }
};

const addAdmin = async (req, res) => {
  try {
    const result = await userModel.addAdmin(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleUserError(res, error, "Gagal menambahkan pengguna");
  }
};

const updateAdmin = async (req, res) => {
  try {
    const result = await userModel.updateAdmin({
      id: req.params.id,
      body: req.body,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleUserError(res, error, "Gagal memperbarui pengguna");
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const result = await userModel.deleteAdmin({
      id: req.params.id,
      currentUserId: req.user?.id || req.user?.id_users,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleUserError(res, error, "Gagal menghapus pengguna");
  }
};

module.exports = {
  getAllUsers,
  addAdmin,
  updateAdmin,
  deleteAdmin,
};
