// src/services/kategoriService.js
const API_URL = "http://localhost:3000/api/admin";

// Helper untuk ambil token (PENTING untuk rute Admin)
const getAuthHeader = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// 1. Ambil Semua Kategori untuk Tabel Admin
export const getAdminKategori = async () => {
  try {
    const res = await fetch(`${API_URL}/kategori`, {
      method: "GET",
      headers: {
        ...getAuthHeader(),
      },
    });

    // Cek jika server kirim HTML (error) bukan JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server tidak mengirim JSON. Cek apakah URL-nya benar.");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal ambil kategori admin:", error);
    return [];
  }
};

// 2. Tambah Kategori Baru
export const addKategori = async (namaKategori) => {
  try {
    const res = await fetch(`${API_URL}/kategori`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ nama_kategori: namaKategori }),
    });

    return await res.json();
  } catch (error) {
    console.error("Gagal tambah kategori:", error);
    return { message: "Terjadi kesalahan koneksi" };
  }
};

// 3. Hapus Kategori
export const deleteKategori = async (id) => {
  try {
    const res = await fetch(`${API_URL}/kategori/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });
    return await res.json();
  } catch (error) {
    return { message: "Gagal menghapus" };
  }
};