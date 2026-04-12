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
    return {
      label: "Habis",
      className: "bg-rose-50 text-rose-700 ring-rose-100",
    };
  }

  if (numericStock <= 5) {
    return {
      label: "Stok Tipis",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  return {
    label: "Aman",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
};

export default function PembelianPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${PUBLIC_API_URL}/produk`),
          fetch(`${API_BASE_URL}/api/admin/pesanan`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const productsPayload = await productsRes.json().catch(() => []);
        const ordersPayload = await ordersRes.json().catch(() => []);

        if (!productsRes.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        if (!ordersRes.ok) {
          throw new Error(
            ordersPayload?.message || "Gagal mengambil data transaksi pesanan",
          );
        }

        setProducts(Array.isArray(productsPayload) ? productsPayload : []);
        setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
      } catch (fetchError) {
        setError(fetchError.message || "Gagal memuat data pembelian");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const inventoryStats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce(
      (total, product) => total + Number(product.stok || 0),
      0,
    );
    const stokTipis = products.filter(
      (product) => Number(product.stok || 0) > 0 && Number(product.stok || 0) <= 5,
    ).length;
    const stokHabis = products.filter(
      (product) => Number(product.stok || 0) <= 0,
    ).length;
    const totalTerjual = orders
      .filter((order) => order.status_order === "selesai")
      .reduce((total, order) => total + Number(order.total_item || 0), 0);

    return {
      totalProduk,
      totalStok,
      stokTipis,
      stokHabis,
      totalTerjual,
    };
  }, [orders, products]);

  const productsByStock = useMemo(() => {
    return [...products].sort((a, b) => Number(a.stok || 0) - Number(b.stok || 0));
  }, [products]);

  const latestCompletedOrders = useMemo(() => {
    return orders
      .filter((order) => order.status_order === "selesai")
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Inventory Overview
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Pembelian</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Halaman ini sekarang membaca data asli dari backend. Stok produk
              diambil langsung dari `ms_produk`, dan barang yang sudah terjual
              dihitung dari pesanan dengan status `selesai`.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            <p className="font-semibold">Alur stok aktif</p>
            <p className="mt-1 leading-6">
              Produk ditambahkan dulu ke master barang, lalu stok berkurang ketika
              pesanan diselesaikan admin.
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PackagePlus size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Total Produk</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(inventoryStats.totalProduk)}
              </h2>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ClipboardList size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Total Stok Saat Ini</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(inventoryStats.totalStok)}
              </h2>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Stok Tipis / Habis</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(inventoryStats.stokTipis + inventoryStats.stokHabis)}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {inventoryStats.stokTipis} tipis, {inventoryStats.stokHabis} habis
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShoppingCart size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Unit Terjual</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(inventoryStats.totalTerjual)}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Dari pesanan yang sudah selesai
              </p>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Daftar Stok Produk
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Data ini terhubung langsung ke tabel `ms_produk`.
                  </p>
                </div>
                <Link
                  href="/admin/barang"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Kelola Barang
                </Link>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Produk</th>
                      <th className="px-4 py-3 font-semibold">Kategori</th>
                      <th className="px-4 py-3 font-semibold">Harga</th>
                      <th className="px-4 py-3 font-semibold">Stok</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsByStock.map((product) => {
                      const tone = statusTone(product.stok);

                      return (
                        <tr
                          key={product.id_produk}
                          className="border-t border-slate-100 text-sm text-slate-600"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {product.nama_produk}
                            </p>
                          </td>
                          <td className="px-4 py-4">{product.merek || "-"}</td>
                          <td className="px-4 py-4 font-medium text-slate-800">
                            {formatCurrency(product.harga_produk)}
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-900">
                            {formatNumber(product.stok)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.className}`}
                            >
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

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Catatan Implementasi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Alur stok yang sedang dipakai sekarang.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Sumber stok ada di produk
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Nilai stok dibaca langsung dari `ms_produk.stok`, jadi halaman
                      ini menampilkan kondisi inventori terkini.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Stok bergerak saat pesanan selesai
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Ketika admin mengubah status order menjadi `selesai`, backend
                      mengurangi stok produk sesuai quantity barang yang terjual.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Pesanan Selesai Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ringkasan transaksi yang sudah memengaruhi stok.
                </p>

                <div className="mt-5 space-y-3">
                  {latestCompletedOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Belum ada pesanan selesai yang tercatat.
                    </div>
                  ) : (
                    latestCompletedOrders.map((order) => (
                      <div
                        key={order.id_pesanan}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="font-semibold text-slate-900">
                          #ORD-{String(order.id_pesanan).padStart(4, "0")}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.nama_pelanggan || "Pelanggan"} - {order.produk_ringkas || "-"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {formatNumber(order.total_item)} unit |{" "}
                          {formatCurrency(order.total_harga)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
