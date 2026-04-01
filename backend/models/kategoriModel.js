const connection = require("../config/database");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getKategoriName = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getAllKategori = async () => {
  const sql = `
    SELECT 
      id_kategori,
      nama_kategori
    FROM ms_kategori
    ORDER BY nama_kategori ASC
  `;
  const [kategori] = await connection.query(sql);
  return kategori;
};

const addKategori = async (body) => {
  const namaKategori = getKategoriName(body?.nama_kategori);

  if (!namaKategori) {
    throw createHttpError(400, "Nama kategori wajib diisi");
  }

  const [existingKategori] = await connection.query(
    "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) LIMIT 1",
    [namaKategori],
  );

  if (existingKategori.length > 0) {
    throw createHttpError(400, "Kategori sudah ada");
  }

  const [result] = await connection.query(
    "INSERT INTO ms_kategori (nama_kategori) VALUES (?)",
    [namaKategori],
  );

  const [newKategori] = await connection.query(
    "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ?",
    [result.insertId],
  );

  return newKategori[0];
};

const updateKategori = async ({ id, body }) => {
  const kategoriId = Number(id);
  const namaKategori = getKategoriName(body?.nama_kategori);

  if (!kategoriId) {
    throw createHttpError(400, "ID kategori tidak valid");
  }

  if (!namaKategori) {
    throw createHttpError(400, "Nama kategori wajib diisi");
  }

  const [existingKategori] = await connection.query(
    "SELECT id_kategori FROM ms_kategori WHERE id_kategori = ? LIMIT 1",
    [kategoriId],
  );

  if (existingKategori.length === 0) {
    throw createHttpError(404, "Kategori tidak ditemukan");
  }

  const [duplicateKategori] = await connection.query(
    "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) AND id_kategori != ? LIMIT 1",
    [namaKategori, kategoriId],
  );

  if (duplicateKategori.length > 0) {
    throw createHttpError(400, "Nama kategori sudah digunakan");
  }

  await connection.query(
    "UPDATE ms_kategori SET nama_kategori = ? WHERE id_kategori = ?",
    [namaKategori, kategoriId],
  );

  const [updatedKategori] = await connection.query(
    "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ?",
    [kategoriId],
  );

  return updatedKategori[0];
};

const deleteKategori = async (id) => {
  const kategoriId = Number(id);

  if (!kategoriId) {
    throw createHttpError(400, "ID kategori tidak valid");
  }

  const [existingKategori] = await connection.query(
    "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ? LIMIT 1",
    [kategoriId],
  );

  if (existingKategori.length === 0) {
    throw createHttpError(404, "Kategori tidak ditemukan");
  }

  const [usedByProduk] = await connection.query(
    "SELECT id_produk FROM ms_produk WHERE ms_kategori_id_kategori = ? LIMIT 1",
    [kategoriId],
  );

  if (usedByProduk.length > 0) {
    throw createHttpError(400, "Kategori tidak bisa dihapus karena masih digunakan oleh produk");
  }

  await connection.query("DELETE FROM ms_kategori WHERE id_kategori = ?", [kategoriId]);

  return {
    message: `Kategori "${existingKategori[0].nama_kategori}" berhasil dihapus`,
  };
};

module.exports = { getAllKategori, addKategori, updateKategori, deleteKategori };
