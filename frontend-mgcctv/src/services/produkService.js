// src/services/produkService.js
const API_URL = "http://localhost:3000/api/public";

// Fungsi helper untuk ambil token biar nggak ngetik berulang-ulang
const getAuthHeader = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Ambil Semua Produk (Data Barang)
export const getAllProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/produk`, {
      method: "GET",
      headers: {
        ...getAuthHeader(), // <--- Menempelkan token di sini
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    
    // Jika satpam backend bilang token tidak valid
    if (data.message === "Token tidak valid") {
       console.error("Wah, kuncinya salah atau sudah expired!");
       return [];
    }

    return Array.isArray(data) ? data : []; 
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    return [];
  }
};

// Ambil Semua Kategori (Merek)
export const getAllCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/kategori`, {
      method: "GET",
      headers: {
        ...getAuthHeader(), // <--- Menempelkan token di sini
      },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
};