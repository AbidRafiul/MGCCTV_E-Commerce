"use client";

import { AUTH_API_URL } from "@/lib/api";

const CHECKOUT_STORAGE_KEY = "mgcctv-checkout";

const isBrowser = () => typeof window !== "undefined";

const getToken = () =>
  isBrowser() ? localStorage.getItem("token") || "" : "";

const getAuthHeaders = () => {
  const token = getToken();

  if (!token) {
    const error = new Error("Silakan login terlebih dahulu");
    error.status = 401;
    throw error;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

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
        subtotal:
          Number(item.subtotal) ||
          (Number(item.harga_produk) || 0) *
            normalizeQuantity(item.quantity, stokTersedia),
      };
    });
};

const emitCartUpdated = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("cart-updated"));
};

const parseCartResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getCartItems = async () => {
  const response = await fetch(`${AUTH_API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await parseCartResponse(response, "Gagal mengambil keranjang");
  return normalizeCartItems(data.items);
};

export const getCartCount = async () => {
  const response = await fetch(`${AUTH_API_URL}/cart/count`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await parseCartResponse(
    response,
    "Gagal mengambil jumlah keranjang",
  );

  return Number(data.totalItems || 0);
};

export const addCartItem = async (product, quantity = 1) => {
  const response = await fetch(`${AUTH_API_URL}/cart/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id_produk: product?.id_produk,
      quantity,
    }),

    
  });
  window.dispatchEvent(new Event("cart-updated"));

  const data = await parseCartResponse(
    response,
    "Gagal menambahkan produk ke keranjang",
  );

  emitCartUpdated();
  return normalizeCartItems(data.items);
};

export const updateCartItemQuantity = async (productId, nextQuantity) => {
  const response = await fetch(`${AUTH_API_URL}/cart/items/${productId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      quantity: nextQuantity,
    }),
  });

  const data = await parseCartResponse(
    response,
    "Gagal memperbarui jumlah produk",
  );

  emitCartUpdated();
  return normalizeCartItems(data.items);
};

export const removeCartItem = async (productId) => {
  const response = await fetch(`${AUTH_API_URL}/cart/items/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await parseCartResponse(
    response,
    "Gagal menghapus produk dari keranjang",
  );

  emitCartUpdated();
  return normalizeCartItems(data.items);
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
  emitCartUpdated();
};
