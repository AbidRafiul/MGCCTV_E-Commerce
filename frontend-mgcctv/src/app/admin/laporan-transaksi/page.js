"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarRange,
  Download,
  Filter,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingBag,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PackagePlus,
  History,
  UserCheck
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

// --- DATA PENJUALAN ---
const salesCards = [
  { title: "Omzet Bulan Ini", value: formatCurrency(28750000), note: "+12,4% dari bulan lalu", icon: Wallet, tone: "emerald" },
  { title: "Transaksi Berhasil", value: "184 Pesanan", note: "Rata-rata 6 pesanan per hari", icon: ReceiptText, tone: "blue" },
  { title: "Produk Terjual", value: "329 Unit", note: "Didominasi kamera indoor", icon: ShoppingBag, tone: "amber" },
  { title: "Nilai Rata-rata", value: formatCurrency(156250), note: "Per transaksi selesai", icon: BadgeDollarSign, tone: "violet" },
];

const transactions = [
  { id: "INV-2026-0412-001", customer: "Rizky Saputra", channel: "Website", items: "Hikvision Dome x2, DVR x1", total: 4250000, payment: "Transfer Bank", status: "Selesai", date: "12 Apr 2026, 09:15" },
  { id: "INV-2026-0411-028", customer: "PT Sumber Jaya", channel: "WhatsApp", items: "Paket 8 Channel x1", total: 8750000, payment: "Termin", status: "Diproses", date: "11 Apr 2026, 16:40" },
  { id: "INV-2026-0411-019", customer: "Aulia Rahman", channel: "Marketplace", items: "Kamera Outdoor x3", total: 3150000, payment: "QRIS", status: "Selesai", date: "11 Apr 2026, 10:22" },
  { id: "INV-2026-0410-014", customer: "Toko Bina Karya", channel: "Website", items: "Switch PoE x2, Kabel x4", total: 2680000, payment: "Transfer Bank", status: "Menunggu", date: "10 Apr 2026, 13:08" },
  { id: "INV-2026-0409-031", customer: "Yuni Lestari", channel: "Website", items: "IP Camera x1", total: 1450000, payment: "COD", status: "Dibatalkan", date: "9 Apr 2026, 18:27" },
];

const topProducts = [
  { name: "Hikvision Dome 2MP", sold: 48, revenue: 12480000, change: "Naik 18%" },
  { name: "Paket CCTV 4 Channel", sold: 21, revenue: 18900000, change: "Naik 11%" },
  { name: "IP Camera Outdoor 5MP", sold: 17, revenue: 14450000, change: "Turun 4%" },
];

// --- DATA RESTOK ---
const restockCards = [
  { title: "Total Barang Masuk", value: "55 Unit", note: "Bulan ini", icon: PackagePlus, tone: "blue" },
  { title: "Frekuensi Restok", value: "12 Kali", note: "Aktivitas penambahan stok", icon: History, tone: "emerald" },
  { title: "Produk Terbanyak", value: "Hikvision Dome", note: "Menyumbang 40% stok baru", icon: ShoppingBag, tone: "amber" },
  { title: "Admin Teraktif", value: "Fatah Rizqi", note: "Melakukan 8x input", icon: UserCheck, tone: "violet" },
];

const restockTransactions = [
  { id: "RST-2026-0412-001", product: "Hikvision Dome 2MP", jumlah: 25, admin: "Fatah Rizqi", date: "12 Apr 2026, 08:00" },
  { id: "RST-2026-0411-002", product: "Kabel Coaxial 100m", jumlah: 10, admin: "Syifa Nurrohmah", date: "11 Apr 2026, 14:30" },
  { id: "RST-2026-0409-001", product: "DVR 8 Channel Dahua", jumlah: 5, admin: "Abid Rafi'ul", date: "09 Apr 2026, 09:15" },
  { id: "RST-2026-0408-003", product: "Power Supply 12V 20A", jumlah: 15, admin: "Fatah Rizqi", date: "08 Apr 2026, 16:20" },
];

const toneStyles = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
};

const statusStyles = {
  Selesai: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Diproses: "bg-blue-50 text-blue-700 ring-blue-100",
  Menunggu: "bg-amber-50 text-amber-700 ring-amber-100",
  Dibatalkan: "bg-rose-50 text-rose-700 ring-rose-100",
};

export default function LaporanTransaksiPage() {
  const [activeTab, setActiveTab] = useState("penjualan");

  const currentCards = activeTab === "penjualan" ? salesCards : restockCards;
  const currentTopProducts = activeTab === "penjualan" ? topProducts : [
    { name: "Hikvision Dome 2MP", sold: 25, revenue: 0, change: "Restok" },
    { name: "Power Supply 12V", sold: 15, revenue: 0, change: "Restok" },
    { name: "Kabel Coaxial 100m", sold: 10, revenue: 0, change: "Restok" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER - Judul dan Keterangan sudah diperbaiki */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Admin Report
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Laporan Transaksi
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lihat riwayat penjualan barang ke pelanggan dan catatan stok masuk toko MG CCTV.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              <CalendarRange size={16} />
              1 Apr 2026 - 12 Apr 2026
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0C2C55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900">
              <Download size={16} />
              Export Laporan
            </button>
          </div>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {currentCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{card.value}</h2>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${toneStyles[card.tone]}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{card.note}</p>
            </article>
          );
        })}
      </section>

      {/* MAIN CONTENT */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        
        {/* KOLOM KIRI (TABEL) */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Riwayat Data</h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeTab === "penjualan" ? "Daftar pesanan dari pembeli." : "Daftar barang yang baru masuk ke gudang."}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setActiveTab("penjualan")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "penjualan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ArrowUpCircle size={16} className={activeTab === "penjualan" ? "text-emerald-500" : ""} /> 
                Penjualan
              </button>
              <button
                onClick={() => setActiveTab("pembelian")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "pembelian" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ArrowDownCircle size={16} className={activeTab === "pembelian" ? "text-blue-500" : ""} /> 
                Barang Masuk
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row px-6 py-4 border-b border-slate-100">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <Search size={16} />
              {activeTab === "penjualan" ? "Cari nomor invoice / nama pelanggan" : "Cari nama produk / admin"}
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  {activeTab === "penjualan" ? (
                    <>
                      <th className="px-6 py-4 font-semibold">Invoice</th>
                      <th className="px-6 py-4 font-semibold">Pelanggan</th>
                      <th className="px-6 py-4 font-semibold">Item</th>
                      <th className="px-6 py-4 font-semibold">Total</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-semibold">ID Log</th>
                      <th className="px-6 py-4 font-semibold">Nama Produk</th>
                      <th className="px-6 py-4 font-semibold text-center">Jumlah</th>
                      <th className="px-6 py-4 font-semibold">Admin</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === "penjualan" && transactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600">
                    <td className="px-6 py-4 align-top">
                      <p className="font-semibold text-slate-900">{t.id}</p>
                      <p className="mt-1 text-xs text-slate-400">{t.date}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-semibold text-slate-800">{t.customer}</p>
                      <p className="mt-1 text-xs text-slate-400">{t.channel}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-xs text-slate-500">{t.items}</td>
                    <td className="px-6 py-4 align-top font-semibold text-slate-900">{formatCurrency(t.total)}</td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[t.status]}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}

                {activeTab === "pembelian" && restockTransactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600 bg-blue-50/10">
                    <td className="px-6 py-4 align-top">
                      <p className="font-semibold text-slate-900">{t.id}</p>
                      <p className="mt-1 text-xs text-slate-400">{t.date}</p>
                    </td>
                    <td className="px-6 py-4 align-top font-bold text-slate-800">{t.product}</td>
                    <td className="px-6 py-4 align-top text-center">
                      <span className="inline-flex items-center justify-center font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-xl">
                        +{t.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                        {t.admin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN (INSIGHTS) */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PackageCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Info Toko</h2>
                <p className="text-sm text-slate-500">Ringkasan aktivitas minggu ini.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {activeTab === "penjualan" ? (
                <>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <ArrowUpRight size={16} />
                      <p className="text-sm font-semibold">Penjualan naik</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">Produk paket bundling sedang banyak diminati pembeli.</p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <PackagePlus size={16} />
                    <p className="text-sm font-semibold">Stok aman</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-blue-800">Pengadaan barang berjalan lancar untuk kategori kamera indoor.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === "penjualan" ? "Produk Terlaris" : "Sering Di-restok"}
            </h2>
            <div className="mt-5 space-y-4">
              {currentTopProducts.map((product, index) => (
                <div key={product.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-700 shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sold} unit</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 uppercase">
                      {product.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}