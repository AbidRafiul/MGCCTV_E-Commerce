import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const PUBLIC_API = "http://localhost:3000/api/public/kategori";
const ADMIN_API = "http://localhost:3000/api/admin/kategori";

export const useKategori = () => {
  const [kategori, setKategori] = useState([]);
  const [namaKategori, setNamaKategori] = useState("");
  const [editingKategoriId, setEditingKategoriId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionKategoriId, setActionKategoriId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchKategori = async () => {
    try {
      setError("");
      const res = await fetch(PUBLIC_API, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil data kategori");
      setKategori(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message || "Gagal mengambil data kategori");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const isEditing = editingKategoriId !== null;
      const res = await fetch(isEditing ? `${ADMIN_API}/${editingKategoriId}` : ADMIN_API, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nama_kategori: namaKategori }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan kategori");

      if (isEditing) {
        setKategori((prev) =>
          prev
            .map((item) => (item.id_kategori === editingKategoriId ? data.kategori : item))
            .sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori))
        );
      } else {
        setKategori((prev) =>
          [...prev, data.kategori].sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori))
        );
      }

      setNamaKategori("");
      setEditingKategoriId(null);
      setSuccess(data.message || (isEditing ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan"));
    } catch (submitError) {
      setError(submitError.message || "Gagal menyimpan kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingKategoriId(item.id_kategori);
    setNamaKategori(item.nama_kategori);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingKategoriId(null);
    setNamaKategori("");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Hapus kategori ini?",
      text: `Apakah Anda yakin ingin menghapus kategori "${item.nama_kategori}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setActionKategoriId(item.id_kategori);
      setError("");
      setSuccess("");

      const res = await fetch(`${ADMIN_API}/${item.id_kategori}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menghapus kategori");

      setKategori((prev) => prev.filter((kategoriItem) => kategoriItem.id_kategori !== item.id_kategori));
      if (editingKategoriId === item.id_kategori) handleCancelEdit();
      
      setSuccess(data.message || "Kategori berhasil dihapus");
    } catch (deleteError) {
      setError(deleteError.message || "Gagal menghapus kategori");
    } finally {
      setActionKategoriId(null);
    }
  };

  return {
    kategori, namaKategori, setNamaKategori, editingKategoriId,
    isLoading, isSaving, actionKategoriId, error, success,
    handleSubmit, handleEdit, handleCancelEdit, handleDelete
  };
};