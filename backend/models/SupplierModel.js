const db = require("../config/database");

const SupplierModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        s.id_supplier,
        s.nama_supplier,
        s.no_hp,
        s.alamat,
        s.created_by,
        u.nama AS created_by_nama,
        u.role AS created_by_role,
        s.created_at,
        s.updated_at
      FROM ms_supplier s
      LEFT JOIN ms_users u ON u.id_users = s.created_by
      ORDER BY s.id_supplier DESC
    `);

    return rows;
  },

  getById: async (id_supplier) => {
    const [rows] = await db.query(
      `
      SELECT 
        s.id_supplier,
        s.nama_supplier,
        s.no_hp,
        s.alamat,
        s.created_by,
        u.nama AS created_by_nama,
        u.role AS created_by_role,
        s.created_at,
        s.updated_at
      FROM ms_supplier s
      LEFT JOIN ms_users u ON u.id_users = s.created_by
      WHERE s.id_supplier = ?
      `,
      [id_supplier]
    );

    return rows[0];
  },

  create: async (data) => {
    const { nama_supplier, no_hp, alamat, created_by } = data;

    const [result] = await db.query(
      `
      INSERT INTO ms_supplier 
      (nama_supplier, no_hp, alamat, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      `,
      [nama_supplier, no_hp, alamat, created_by]
    );

    return result.insertId;
  },

  update: async (id_supplier, data) => {
    const { nama_supplier, no_hp, alamat } = data;

    const [result] = await db.query(
      `
      UPDATE ms_supplier
      SET 
        nama_supplier = ?,
        no_hp = ?,
        alamat = ?,
        updated_at = NOW()
      WHERE id_supplier = ?
      `,
      [nama_supplier, no_hp, alamat, id_supplier]
    );

    return result.affectedRows;
  },

  delete: async (id_supplier) => {
    const [result] = await db.query(
      `
      DELETE FROM ms_supplier
      WHERE id_supplier = ?
      `,
      [id_supplier]
    );

    return result.affectedRows;
  },
};

module.exports = SupplierModel;
