"use client";

import { useEffect, useState } from "react";
import { Edit3, FolderPlus, LoaderCircle, Tag, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3000/api/admin/kategori";

export default function KategoriPage() {
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

      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data kategori");
      }

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
      const res = await fetch(
        isEditing ? `${API_URL}/${editingKategoriId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            nama_kategori: namaKategori,
          }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan kategori");
      }

      if (isEditing) {
        setKategori((prev) =>
          prev
            .map((item) =>
              item.id_kategori === editingKategoriId ? data.kategori : item,
            )
            .sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori)),
        );
      } else {
        setKategori((prev) =>
          [...prev, data.kategori].sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori)),
        );
      }

      setNamaKategori("");
      setEditingKategoriId(null);
      setSuccess(
        data.message ||
          (isEditing ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan"),
      );
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionKategoriId(item.id_kategori);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/${item.id_kategori}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus kategori");
      }

      setKategori((prev) =>
        prev.filter((kategoriItem) => kategoriItem.id_kategori !== item.id_kategori),
      );

      if (editingKategoriId === item.id_kategori) {
        handleCancelEdit();
      }

      setSuccess(data.message || "Kategori berhasil dihapus");
    } catch (deleteError) {
      setError(deleteError.message || "Gagal menghapus kategori");
    } finally {
      setActionKategoriId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FolderPlus size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Kategori</h1>
            <p className="mt-1 text-sm text-slate-500">
              Isikan kategori merk CCTV.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={namaKategori}
            onChange={(event) => setNamaKategori(event.target.value)}
            placeholder="Contoh: CCTV Indoor"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : editingKategoriId ? "Simpan Perubahan" : "Tambah Kategori"}
          </button>
          {editingKategoriId ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal Edit
            </button>
          ) : null}
        </form>

        {error ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Daftar Kategori</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total {kategori.length} kategori tersedia.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-12 text-slate-500">
            <LoaderCircle className="animate-spin" size={18} />
            <span>Memuat kategori...</span>
          </div>
        ) : kategori.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Belum ada kategori yang ditambahkan.
          </div>
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {kategori.map((item) => (
              <div
                key={item.id_kategori}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                      <Tag size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        ID {item.id_kategori}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.nama_kategori}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
                      title="Edit kategori"
                    >
                      {editingKategoriId === item.id_kategori ? <X size={16} /> : <Edit3 size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={actionKategoriId === item.id_kategori}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                      title="Hapus kategori"
                    >
                      {actionKategoriId === item.id_kategori ? (
                        <LoaderCircle className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
