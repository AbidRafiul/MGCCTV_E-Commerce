const connection = require("../config/database");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CMS_CONTENT_TABLE = "tr_cms_konten";
const CMS_GALLERY_TABLE = "tr_cms_galleries";
const GALLERY_SECTION_NAME = "Galeri";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
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

const deleteImageByUrl = async (url) => {
  if (!url || !url.includes("cloudinary")) {
    return;
  }

  const publicId = getPublicIdFromUrl(url);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

const getTentangContent = async () => {
  const [rows] = await connection.query(
    `SELECT id_cms_konten, section_name, content_value, url_gambar
     FROM ${CMS_CONTENT_TABLE}
     ORDER BY id_cms_konten ASC`,
  );

  return rows;
};

const getGallery = async () => {
  const [rows] = await connection.query(
    `SELECT id_cms_konten, section_name, url_gambar
     FROM ${CMS_GALLERY_TABLE}
     ORDER BY created_at DESC, id_cms_konten DESC`,
  );

  return rows;
};

const updateTentangContent = async ({ id, sectionName, contentValue, urlGambar, file }) => {
  const contentId = Number(id);

  if (!contentId) {
    throw createHttpError(400, "ID konten CMS tidak valid");
  }

  const [existingRows] = await connection.query(
    `SELECT id_cms_konten, section_name, content_value, url_gambar
     FROM ${CMS_CONTENT_TABLE}
     WHERE id_cms_konten = ?
     LIMIT 1`,
    [contentId],
  );

  const existingContent = existingRows[0] || null;
  let nextImageUrl = existingContent?.url_gambar ?? null;

  if (file) {
    const uploadResult = await uploadImage(file.buffer, "MGCCTV/CMS_Tentang");
    nextImageUrl = uploadResult.secure_url;

    if (existingContent?.url_gambar && existingContent.url_gambar !== nextImageUrl) {
      await deleteImageByUrl(existingContent.url_gambar);
    }
  } else if (urlGambar !== undefined) {
    nextImageUrl = urlGambar;
  }

  if (!existingContent) {
    await connection.query(
      `INSERT INTO ${CMS_CONTENT_TABLE}
       (id_cms_konten, section_name, content_value, url_gambar, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [contentId, sectionName, contentValue, nextImageUrl],
    );
  } else if (nextImageUrl !== undefined && nextImageUrl !== null) {
    await connection.query(
      `UPDATE ${CMS_CONTENT_TABLE}
       SET section_name = ?, content_value = ?, url_gambar = ?, updated_at = NOW()
       WHERE id_cms_konten = ?`,
      [
        sectionName ?? existingContent.section_name,
        contentValue ?? existingContent.content_value,
        nextImageUrl,
        contentId,
      ],
    );
  } else {
    await connection.query(
      `UPDATE ${CMS_CONTENT_TABLE}
       SET section_name = ?, content_value = ?, updated_at = NOW()
       WHERE id_cms_konten = ?`,
      [
        sectionName ?? existingContent.section_name,
        contentValue ?? existingContent.content_value,
        contentId,
      ],
    );
  }

  const [updatedRows] = await connection.query(
    `SELECT id_cms_konten, section_name, content_value, url_gambar
     FROM ${CMS_CONTENT_TABLE}
     WHERE id_cms_konten = ?
     LIMIT 1`,
    [contentId],
  );

  return updatedRows[0];
};

const addGallery = async ({ sectionName, file }) => {
  if (!file) {
    throw createHttpError(400, "Gambar galeri wajib diunggah");
  }

  const uploadResult = await uploadImage(file.buffer, "MGCCTV/CMS_Galeri");
  const finalSectionName = sectionName || GALLERY_SECTION_NAME;

  const [insertResult] = await connection.query(
    `INSERT INTO ${CMS_GALLERY_TABLE} (section_name, url_gambar, created_at, updated_at)
     VALUES (?, ?, NOW(), NOW())`,
    [finalSectionName, uploadResult.secure_url],
  );

  const [newRows] = await connection.query(
    `SELECT id_cms_konten, section_name, url_gambar
     FROM ${CMS_GALLERY_TABLE}
     WHERE id_cms_konten = ?
     LIMIT 1`,
    [insertResult.insertId],
  );

  return newRows[0];
};

const deleteGallery = async (id) => {
  const galleryId = Number(id);

  if (!galleryId) {
    throw createHttpError(400, "ID galeri tidak valid");
  }

  const [existingRows] = await connection.query(
    `SELECT id_cms_konten, url_gambar
     FROM ${CMS_GALLERY_TABLE}
     WHERE id_cms_konten = ?
     LIMIT 1`,
    [galleryId],
  );

  if (existingRows.length === 0) {
    throw createHttpError(404, "Foto galeri tidak ditemukan");
  }

  await deleteImageByUrl(existingRows[0].url_gambar);
  await connection.query(`DELETE FROM ${CMS_GALLERY_TABLE} WHERE id_cms_konten = ?`, [galleryId]);
};

module.exports = {
  getTentangContent,
  getGallery,
  updateTentangContent,
  addGallery,
  deleteGallery,
};
