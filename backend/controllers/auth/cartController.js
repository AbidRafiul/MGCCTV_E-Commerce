const cartModel = require("../../models/cartModel");

const handleCartError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getCartItems = async (req, res) => {
  try {
    const result = await cartModel.getCartItemsByUserId(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleCartError(res, error, "Gagal mengambil keranjang");
  }
};

const getCartCount = async (req, res) => {
  try {
    const result = await cartModel.getCartCountByUserId(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleCartError(res, error, "Gagal mengambil jumlah keranjang");
  }
};

const addCartItem = async (req, res) => {
  try {
    const result = await cartModel.addCartItem({
      userId: req.user.id,
      productId: req.body.id_produk,
      quantity: req.body.quantity,
    });

    return res.status(200).json({
      message: "Produk berhasil dimasukkan ke keranjang",
      ...result,
    });
  } catch (error) {
    return handleCartError(res, error, "Gagal menambahkan produk ke keranjang");
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const result = await cartModel.updateCartItemQuantity({
      userId: req.user.id,
      productId: req.params.productId,
      quantity: req.body.quantity,
    });

    return res.status(200).json({
      message: "Jumlah produk berhasil diperbarui",
      ...result,
    });
  } catch (error) {
    return handleCartError(res, error, "Gagal memperbarui jumlah produk");
  }
};

const removeCartItem = async (req, res) => {
  try {
    const result = await cartModel.removeCartItem({
      userId: req.user.id,
      productId: req.params.productId,
    });

    return res.status(200).json({
      message: "Produk berhasil dihapus dari keranjang",
      ...result,
    });
  } catch (error) {
    return handleCartError(res, error, "Gagal menghapus produk dari keranjang");
  }
};

module.exports = {
  getCartItems,
  getCartCount,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
};
