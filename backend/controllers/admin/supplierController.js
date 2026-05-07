const SupplierModel = require("../../models/SupplierModel");

const SupplierController = {
  getAllSupplier: async (req, res) => {
    try {
      const suppliers = await SupplierModel.getAll();

      res.status(200).json({
        success: true,
        message: "Data supplier berhasil diambil",
        data: suppliers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data supplier",
        error: error.message,
      });
    }
  },

  getSupplierById: async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await SupplierModel.getById(id);

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier tidak ditemukan",
        });
      }

      res.status(200).json({
        success: true,
        message: "Detail supplier berhasil diambil",
        data: supplier,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail supplier",
        error: error.message,
      });
    }
  },

  createSupplier: async (req, res) => {
    try {
      const { nama_supplier, no_hp, alamat } = req.body;
      const created_by = req.user?.id || req.user?.id_users;

      if (!nama_supplier) {
        return res.status(400).json({
          success: false,
          message: "Nama supplier wajib diisi",
        });
      }

      const id_supplier = await SupplierModel.create({
        nama_supplier,
        no_hp,
        alamat,
        created_by,
      });

      res.status(201).json({
        success: true,
        message: "Supplier berhasil ditambahkan",
        data: { id_supplier },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal menambahkan supplier",
        error: error.message,
      });
    }
  },

  updateSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_supplier, no_hp, alamat } = req.body;

      if (!nama_supplier) {
        return res.status(400).json({
          success: false,
          message: "Nama supplier wajib diisi",
        });
      }

      const affectedRows = await SupplierModel.update(id, {
        nama_supplier,
        no_hp,
        alamat,
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Supplier tidak ditemukan",
        });
      }

      res.status(200).json({
        success: true,
        message: "Supplier berhasil diperbarui",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui supplier",
        error: error.message,
      });
    }
  },

  deleteSupplier: async (req, res) => {
    try {
      const { id } = req.params;

      const affectedRows = await SupplierModel.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Supplier tidak ditemukan",
        });
      }

      res.status(200).json({
        success: true,
        message: "Supplier berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal menghapus supplier",
        error: error.message,
      });
    }
  },
};

module.exports = SupplierController;
