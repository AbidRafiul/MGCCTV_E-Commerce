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
        ...getAuthHeader(),
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
        ...getAuthHeader(), 
      },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
};

// Ambil Detail Produk Berdasarkan ID
export const getProductById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/produk/${id}`, {
      method: "GET",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.message === "Token tidak valid") {
       console.error("Wah, kuncinya salah atau sudah expired!");
       return null;
    }

    return data.data || data; 
  } catch (error) {
    console.error(`Gagal mengambil detail produk ID ${id}:`, error);
    return null;
  }
};