const connection = require("../config/database");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getPublicIdFromUrl = (url) => {
  if (!url) {
    return null;
  }

  try {
    const uploadMarker = "/upload/";
    const uploadIndex = url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    const publicPath = url.slice(uploadIndex + uploadMarker.length).split("/").slice(1).join("/");
    return publicPath.replace(/\.[^/.]+$/, "");
  } catch (error) {
    return null;
  }
};

const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });

const deleteImageByUrl = async (url) => {
  if (!url || !url.includes("cloudinary")) {
    return;
  }

  const publicId = getPublicIdFromUrl(url);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

const getCurrentTimestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const getAllProduk = async () => {
  const query = `
    SELECT p.*, k.nama_kategori AS merek 
    FROM ms_produk p
    LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
    ORDER BY p.created_at DESC
  `;

  const [produk] = await connection.query(query);
  return produk;
};

const getProdukById = async (id) => {
  const query = `
    SELECT p.*, k.nama_kategori AS merek, k.nama_kategori AS nama_kategori
    FROM ms_produk p
    LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
    WHERE p.id_produk = ?
  `;

  const [produk] = await connection.query(query, [id]);

  if (produk.length === 0) {
    throw createHttpError(404, "Produk tidak ditemukan");
  }

  return produk[0];
};

const addProduk = async ({ body, file }) => {
  const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = body;
  let imageUrl = "";

  if (file) {
    const result = await uploadImage(file.buffer, "mgcctv_produk");
    imageUrl = result.secure_url;
  }

  const query = `
    INSERT INTO ms_produk 
    (nama_produk, deskripsi_produk, gambar_produk, harga_produk, stok, status_produk, ms_kategori_id_kategori, created_at) 
    VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
  `;

  const values = [nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori];
  const [insertResult] = await connection.query(query, values);

  return {
    message: "Produk dan gambar berhasil disimpan!",
    id_produk: insertResult.insertId,
    gambar_url: imageUrl,
  };
};

const updateProduk = async ({ id, body, file }) => {
  const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = body;

  const [oldProduct] = await connection.query(
    "SELECT gambar_produk FROM ms_produk WHERE id_produk = ?",
    [id],
  );

  if (oldProduct.length === 0) {
    throw createHttpError(404, "Produk tidak ditemukan");
  }

  let imageUrl = oldProduct[0].gambar_produk;

  if (file) {
    await deleteImageByUrl(imageUrl);
    const result = await uploadImage(file.buffer, "mgcctv_produk");
    imageUrl = result.secure_url;
  }

  const query = `
    UPDATE ms_produk 
    SET nama_produk=?, deskripsi_produk=?, gambar_produk=?, harga_produk=?, stok=?, ms_kategori_id_kategori=?, updated_at=? 
    WHERE id_produk=?
  `;

  await connection.query(query, [
    nama_produk,
    deskripsi_produk,
    imageUrl,
    harga_produk,
    stok,
    ms_kategori_id_kategori,
    getCurrentTimestamp(),
    id,
  ]);

  return {
    message: "Produk berhasil diperbarui!",
    gambar_url: imageUrl,
  };
};

const deleteProduk = async (id) => {
  const [produk] = await connection.query("SELECT gambar_produk FROM ms_produk WHERE id_produk = ?", [id]);
  if (produk.length === 0) {
    throw createHttpError(404, "Produk tidak ditemukan");
  }

  await deleteImageByUrl(produk[0].gambar_produk);
  await connection.query("DELETE FROM ms_produk WHERE id_produk = ?", [id]);

  return { message: "Produk dan gambar berhasil dihapus!" };
};

const updateStatusProduk = async ({ id, statusProduk }) => {
  await connection.query(
    "UPDATE ms_produk SET status_produk = ?, updated_at = ? WHERE id_produk = ?",
    [statusProduk, getCurrentTimestamp(), id],
  );

  return { message: "Status produk berhasil diperbarui!" };
};

const getProdukUnggulan = async () => {
  const query = `
    SELECT p.*, k.nama_kategori AS merek 
    FROM ms_produk p
    LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori 
    WHERE p.is_unggulan = 1 
    ORDER BY p.updated_at DESC
    LIMIT 6
  `;

  const [results] = await connection.query(query);
  return results;
};

const toggleUnggulan = async ({ id, isUnggulan }) => {
  await connection.query(
    "UPDATE ms_produk SET is_unggulan = ?, updated_at = ? WHERE id_produk = ?",
    [isUnggulan, getCurrentTimestamp(), id],
  );

  return { message: "Status unggulan berhasil diperbarui!" };
};

module.exports = {
  getAllProduk,
  getProdukById,
  addProduk,
  updateProduk,
  deleteProduk,
  updateStatusProduk,
  getProdukUnggulan,
  toggleUnggulan,
};
