"use client";

const CART_STORAGE_KEY = "mgcctv-cart";
const CHECKOUT_STORAGE_KEY = "mgcctv-checkout";

const isBrowser = () => typeof window !== "undefined";

const normalizeStock = (value) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return null;
  return Math.max(0, parsedValue);
};

const normalizeQuantity = (quantity, stock) => {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  if (stock === null) return safeQuantity;
  return Math.min(safeQuantity, Math.max(1, stock));
};

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.id_produk)
    .map((item) => {
      const stokTersedia = normalizeStock(
        item.stok_tersedia ?? item.stok_produk ?? item.stok,
      );

      return {
        id_produk: item.id_produk,
        merek: item.merek || "-",
        nama_produk: item.nama_produk || "Produk",
        harga_produk: Number(item.harga_produk) || 0,
        gambar_produk: item.gambar_produk || "/images/placeholder.jpg",
        stok_tersedia: stokTersedia,
        quantity: normalizeQuantity(item.quantity, stokTersedia),
      };
    });
};

const saveCartItems = (items) => {
  if (!isBrowser()) return [];

  const normalizedItems = normalizeCartItems(items);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
  window.dispatchEvent(new Event("cart-updated"));
  return normalizedItems;
};

export const getCartItems = () => {
  if (!isBrowser()) return [];

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? normalizeCartItems(JSON.parse(storedCart)) : [];
  } catch (error) {
    console.error("Gagal membaca data keranjang:", error);
    return [];
  }
};

export const getCartCount = () => {
  const items = getCartItems();
  return items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
};

export const addCartItem = (product) => {
  const currentItems = getCartItems();
  const productId = product?.id_produk;
  const stokTersedia = normalizeStock(
    product?.stok_tersedia ?? product?.stok_produk ?? product?.stok,
  );

  if (!productId) return currentItems;
  if (stokTersedia !== null && stokTersedia <= 0) return currentItems;

  const existingItemIndex = currentItems.findIndex(
    (item) => item.id_produk === productId,
  );

  if (existingItemIndex >= 0) {
    const existingItem = currentItems[existingItemIndex];
    const updatedStock =
      stokTersedia ?? existingItem.stok_tersedia ?? null;

    currentItems[existingItemIndex] = {
      ...existingItem,
      gambar_produk:
        existingItem.gambar_produk || product.gambar_produk || "/images/placeholder.jpg",
      stok_tersedia: updatedStock,
      quantity: normalizeQuantity(existingItem.quantity + 1, updatedStock),
    };

    return saveCartItems(currentItems);
  }

  return saveCartItems([
    ...currentItems,
    {
      id_produk: product.id_produk,
      merek: product.merek || product.nama_kategori || "-",
      nama_produk: product.nama_produk,
      harga_produk: product.harga_produk,
      gambar_produk: product.gambar_produk || "/images/placeholder.jpg",
      stok_tersedia: stokTersedia,
      quantity: normalizeQuantity(1, stokTersedia),
    },
  ]);
};

export const updateCartItemQuantity = (productId, nextQuantity) => {
  const currentItems = getCartItems();

  const updatedItems = currentItems
    .map((item) =>
      item.id_produk === productId
        ? {
            ...item,
            quantity:
              Number(nextQuantity) <= 0
                ? 0
                : normalizeQuantity(nextQuantity, item.stok_tersedia ?? null),
          }
        : item,
    )
    .filter((item) => item.quantity > 0);

  return saveCartItems(updatedItems);
};

export const removeCartItem = (productId) => {
  const currentItems = getCartItems();
  const filteredItems = currentItems.filter((item) => item.id_produk !== productId);
  return saveCartItems(filteredItems);
};

export const saveCheckoutItems = (items) => {
  if (!isBrowser()) return [];

  const normalizedItems = normalizeCartItems(items);
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(normalizedItems));
  return normalizedItems;
};

export const getCheckoutItems = () => {
  if (!isBrowser()) return [];

  try {
    const storedCheckout = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    return storedCheckout ? normalizeCartItems(JSON.parse(storedCheckout)) : [];
  } catch (error) {
    console.error("Gagal membaca data checkout:", error);
    return [];
  }
};

export const clearCheckoutItems = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(CHECKOUT_STORAGE_KEY);
};

export const clearCartItems = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event("cart-updated"));
};