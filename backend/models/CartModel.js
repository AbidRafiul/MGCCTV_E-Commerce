const connection = require("../config/database");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeCartItem = (item) => ({
  id_produk: Number(item.id_produk),
  merek: item.merek || "-",
  nama_produk: item.nama_produk || "Produk",
  harga_produk: Number(item.harga_produk || 0),
  gambar_produk: item.gambar_produk || "/images/placeholder.jpg",
  stok_tersedia:
    item.stok_tersedia === null || item.stok_tersedia === undefined
      ? null
      : Number(item.stok_tersedia),
  quantity: Number(item.quantity || 0),
  subtotal: Number(item.subtotal || 0),
});

const getActiveCartByUserId = async (userId) => {
  const [rows] = await connection.query(
    `SELECT id_keranjang, id_users, status_keranjang, created_at, updated_at, last_active_at
     FROM tr_keranjang
     WHERE id_users = ? AND status_keranjang = 'active'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId],
  );

  return rows[0] || null;
};

const createActiveCart = async (userId) => {
  const [result] = await connection.query(
    `INSERT INTO tr_keranjang (id_users, status_keranjang, created_at, updated_at, last_active_at)
     VALUES (?, 'active', NOW(), NOW(), NOW())`,
    [userId],
  );

  return {
    id_keranjang: result.insertId,
    id_users: userId,
    status_keranjang: "active",
  };
};

const getOrCreateActiveCart = async (userId) => {
  const existingCart = await getActiveCartByUserId(userId);
  if (existingCart) {
    return existingCart;
  }

  return createActiveCart(userId);
};

const touchCart = async (cartId) => {
  await connection.query(
    `UPDATE tr_keranjang
     SET updated_at = NOW(),
         last_active_at = NOW()
     WHERE id_keranjang = ?`,
    [cartId],
  );
};

const getProductById = async (productId) => {
  const [rows] = await connection.query(
    `SELECT p.id_produk,
            p.nama_produk,
            p.gambar_produk,
            p.harga_produk,
            p.stok AS stok_tersedia,
            p.status_produk,
            k.nama_kategori AS merek
     FROM ms_produk p
     LEFT JOIN ms_kategori k ON k.id_kategori = p.ms_kategori_id_kategori
     WHERE p.id_produk = ?
     LIMIT 1`,
    [productId],
  );

  if (rows.length === 0) {
    throw createHttpError(404, "Produk tidak ditemukan");
  }

  return rows[0];
};

const getCartItemsByCartId = async (cartId) => {
  const [rows] = await connection.query(
    `SELECT ci.id_produk,
            ci.quantity,
            ci.harga_saat_ditambahkan AS harga_produk,
            ci.subtotal,
            p.nama_produk,
            p.gambar_produk,
            p.stok AS stok_tersedia,
            k.nama_kategori AS merek
     FROM tr_keranjang_item ci
     INNER JOIN ms_produk p ON p.id_produk = ci.id_produk
     LEFT JOIN ms_kategori k ON k.id_kategori = p.ms_kategori_id_kategori
     WHERE ci.id_keranjang = ?
     ORDER BY ci.updated_at DESC, ci.id_keranjang_item DESC`,
    [cartId],
  );

  return rows.map(normalizeCartItem);
};

const getCartItemsByUserId = async (userId) => {
  const cart = await getOrCreateActiveCart(userId);
  const items = await getCartItemsByCartId(cart.id_keranjang);

  return {
    cart: {
      id_keranjang: cart.id_keranjang,
      status_keranjang: cart.status_keranjang,
    },
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: items.reduce((total, item) => total + item.subtotal, 0),
  };
};

const getCartCountByUserId = async (userId) => {
  const cart = await getActiveCartByUserId(userId);
  if (!cart) {
    return { totalItems: 0 };
  }

  const [rows] = await connection.query(
    `SELECT COALESCE(SUM(quantity), 0) AS total_items
     FROM tr_keranjang_item
     WHERE id_keranjang = ?`,
    [cart.id_keranjang],
  );

  return {
    totalItems: Number(rows[0]?.total_items || 0),
  };
};

const addCartItem = async ({ userId, productId, quantity }) => {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const product = await getProductById(productId);

  if (Number(product.status_produk) !== 1) {
    throw createHttpError(400, "Produk sedang tidak aktif");
  }

  if (Number(product.stok_tersedia) <= 0) {
    throw createHttpError(400, "Stok produk habis");
  }

  const cart = await getOrCreateActiveCart(userId);

  const [existingItems] = await connection.query(
    `SELECT id_keranjang_item, quantity
     FROM tr_keranjang_item
     WHERE id_keranjang = ? AND id_produk = ?
     LIMIT 1`,
    [cart.id_keranjang, productId],
  );

  if (existingItems.length > 0) {
    const nextQuantity = Math.min(
      Number(existingItems[0].quantity) + safeQuantity,
      Number(product.stok_tersedia),
    );

    await connection.query(
      `UPDATE tr_keranjang_item
       SET quantity = ?,
           harga_saat_ditambahkan = ?,
           subtotal = ?,
           updated_at = NOW()
       WHERE id_keranjang_item = ?`,
      [
        nextQuantity,
        Number(product.harga_produk),
        Number(product.harga_produk) * nextQuantity,
        existingItems[0].id_keranjang_item,
      ],
    );
  } else {
    const nextQuantity = Math.min(safeQuantity, Number(product.stok_tersedia));

    await connection.query(
      `INSERT INTO tr_keranjang_item
       (id_keranjang, id_produk, quantity, harga_saat_ditambahkan, subtotal, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        cart.id_keranjang,
        productId,
        nextQuantity,
        Number(product.harga_produk),
        Number(product.harga_produk) * nextQuantity,
      ],
    );
  }

  await touchCart(cart.id_keranjang);
  return getCartItemsByUserId(userId);
};

const updateCartItemQuantity = async ({ userId, productId, quantity }) => {
  const safeQuantity = Number(quantity);

  if (!Number.isFinite(safeQuantity)) {
    throw createHttpError(400, "Quantity tidak valid");
  }

  const cart = await getOrCreateActiveCart(userId);
  const product = await getProductById(productId);

  const [existingItems] = await connection.query(
    `SELECT id_keranjang_item
     FROM tr_keranjang_item
     WHERE id_keranjang = ? AND id_produk = ?
     LIMIT 1`,
    [cart.id_keranjang, productId],
  );

  if (existingItems.length === 0) {
    throw createHttpError(404, "Item keranjang tidak ditemukan");
  }

  if (safeQuantity <= 0) {
    await connection.query(
      "DELETE FROM tr_keranjang_item WHERE id_keranjang_item = ?",
      [existingItems[0].id_keranjang_item],
    );
  } else {
    const nextQuantity = Math.min(safeQuantity, Number(product.stok_tersedia));

    if (nextQuantity <= 0) {
      throw createHttpError(400, "Stok produk habis");
    }

    await connection.query(
      `UPDATE tr_keranjang_item
       SET quantity = ?,
           harga_saat_ditambahkan = ?,
           subtotal = ?,
           updated_at = NOW()
       WHERE id_keranjang_item = ?`,
      [
        nextQuantity,
        Number(product.harga_produk),
        Number(product.harga_produk) * nextQuantity,
        existingItems[0].id_keranjang_item,
      ],
    );
  }

  await touchCart(cart.id_keranjang);
  return getCartItemsByUserId(userId);
};

const removeCartItem = async ({ userId, productId }) => {
  const cart = await getActiveCartByUserId(userId);
  if (!cart) {
    return getCartItemsByUserId(userId);
  }

  await connection.query(
    `DELETE FROM tr_keranjang_item
     WHERE id_keranjang = ? AND id_produk = ?`,
    [cart.id_keranjang, productId],
  );

  await touchCart(cart.id_keranjang);
  return getCartItemsByUserId(userId);
};

module.exports = {
  getCartItemsByUserId,
  getCartCountByUserId,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
};
