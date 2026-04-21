"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  PackagePlus,
  ShieldCheck,
  ShoppingCart,
  PlusCircle
} from "lucide-react";
import { API_BASE_URL, PUBLIC_API_URL } from "@/lib/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const statusTone = (stok) => {
  const numericStock = Number(stok || 0);
  if (numericStock <= 0) {
    return { label: "Habis", className: "bg-rose-50 text-rose-700 ring-rose-100" };
  }
  if (numericStock <= 5) {
    return { label: "Stok Tipis", className: "bg-amber-50 text-amber-700 ring-amber-100" };
  }
  return { label: "Aman", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
};

export default function PembelianPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE UNTUK FORM PEMBELIAN (BARANG MASUK) ---
  const [formData, setFormData] = useState({
    id_produk: "",
    jumlah_masuk: "",
    catatan: "",
    // id_user sudah dihapus karena otomatis terbaca dari Token JWT di backend
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pindahkan fungsi fetch ke luar useEffect agar bisa dipanggil ulang setelah form submit
  const fetchInventoryData = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${PUBLIC_API_URL}/produk`),
        fetch(`${API_BASE_URL}/api/admin/pesanan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productsPayload = await productsRes.json().catch(() => []);
      const ordersPayload = await ordersRes.json().catch(() => []);

      if (!productsRes.ok) throw new Error("Gagal mengambil data produk");
      
      setProducts(Array.isArray(productsPayload) ? productsPayload : []);
      setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
    } catch (fetchError) {
      setError(fetchError.message || "Gagal memuat data pembelian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchInventoryData();
  }, []);

  // --- FUNGSI HANDLE SUBMIT FORM BARANG MASUK ---
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Ambil token dari localStorage untuk otorisasi backend
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/pembelian/tambah`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Menyisipkan token agar backend mengenali user
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Stok berhasil ditambahkan!");
        // Reset form setelah sukses
        setFormData({ id_produk: "", jumlah_masuk: "", catatan: "" });
        // Panggil fetch lagi untuk update tabel & statistik secara real-time!
        await fetchInventoryData(); 
      } else {
        alert("Error: " + (result.error || result.message));
      }
    } catch (err) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inventoryStats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce((total, product) => total + Number(product.stok || 0), 0);
    const stokTipis = products.filter((p) => Number(p.stok || 0) > 0 && Number(p.stok || 0) <= 5).length;
    const stokHabis = products.filter((p) => Number(p.stok || 0) <= 0).length;
    const totalTerjual = orders
      .filter((order) => order.status_order === "selesai")
      .reduce((total, order) => total + Number(order.total_item || 0), 0);

    return { totalProduk, totalStok, stokTipis, stokHabis, totalTerjual };
  }, [orders, products]);

  const productsByStock = useMemo(() => {
    return [...products].sort((a, b) => Number(a.stok || 0) - Number(b.stok || 0));
  }, [products]);

  const latestCompletedOrders = useMemo(() => {
    return orders.filter((order) => order.status_order === "selesai").slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Inventory Overview
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Pembelian & Stok</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kelola penambahan stok barang dari supplier dan pantau sisa inventaris gudang secara real-time.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={18} />
            <span>Memuat data stok produk...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-10 shadow-sm">
          <p className="text-lg font-bold text-red-600">Data inventori gagal dimuat</p>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Bagian Statistik */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PackagePlus size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Total Produk</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalProduk)}</h2>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ClipboardList size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Total Stok Saat Ini</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalStok)}</h2>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Stok Tipis / Habis</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.stokTipis + inventoryStats.stokHabis)}</h2>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShoppingCart size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Unit Terjual</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalTerjual)}</h2>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)]">
            
            {/* KOLOM KIRI: Tabel Produk */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daftar Stok Produk</h2>
                  <p className="mt-1 text-sm text-slate-500">Data ini terhubung langsung ke tabel `ms_produk`.</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Produk</th>
                      <th className="px-4 py-3 font-semibold">Harga</th>
                      <th className="px-4 py-3 font-semibold">Stok</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsByStock.map((product) => {
                      const tone = statusTone(product.stok);
                      return (
                        <tr key={product.id_produk} className="border-t border-slate-100 text-sm text-slate-600">
                          <td className="px-4 py-4 font-semibold text-slate-900">{product.nama_produk}</td>
                          <td className="px-4 py-4 font-medium text-slate-800">{formatCurrency(product.harga_produk)}</td>
                          <td className="px-4 py-4 font-bold text-slate-900">{formatNumber(product.stok)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.className}`}>
                              {tone.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-6">
              
              {/* --- FORM TAMBAH STOK BARU --- */}
              <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <PackagePlus size={100} />
                </div>
                
                <h2 className="text-lg font-bold text-blue-900 relative z-10">
                  + Form Restock Barang
                </h2>
                <p className="mt-1 text-sm text-blue-700/80 relative z-10">
                  Catat stok masuk dari supplier.
                </p>

                <form onSubmit={handleFormSubmit} className="mt-5 space-y-4 relative z-10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk</label>
                    <select 
                      name="id_produk" 
                      value={formData.id_produk} 
                      onChange={handleFormChange} 
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih --</option>
                      {products.map((p) => (
                        <option key={p.id_produk} value={p.id_produk}>
                          {p.nama_produk} (Sisa: {p.stok})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Masuk</label>
                    <input 
                      type="number" 
                      name="jumlah_masuk" 
                      value={formData.jumlah_masuk} 
                      onChange={handleFormChange} 
                      required min="1"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                    {isSubmitting ? "Menyimpan..." : "Simpan Stok Baru"}
                  </button>
                </form>
              </section>

              {/* Catatan Implementasi & Pesanan Selesai */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Pesanan Selesai Terbaru</h2>
                <div className="mt-5 space-y-3">
                  {latestCompletedOrders.map((order) => (
                    <div key={order.id_pesanan} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">#ORD-{String(order.id_pesanan).padStart(4, "0")}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {formatNumber(order.total_item)} unit | {formatCurrency(order.total_harga)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              
            </div>
          </section>
        </>
      )}
    </div>
  );
}