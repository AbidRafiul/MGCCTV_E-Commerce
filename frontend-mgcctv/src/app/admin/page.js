"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link"; 

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace("IDR", "Rp");

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatShortDateRange = (dates) => {
  if (!Array.isArray(dates) || dates.length === 0) return "Belum ada data";

  const normalizedDates = dates
    .filter(Boolean)
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  if (normalizedDates.length === 0) return "Belum ada data";

  const formatOptions = { day: "2-digit", month: "short", year: "numeric" };
  const firstDate = normalizedDates[0].toLocaleDateString("id-ID", formatOptions);
  const lastDate = normalizedDates[normalizedDates.length - 1].toLocaleDateString("id-ID", formatOptions);

  return normalizedDates.length === 1
    ? `1 tanggal transaksi: ${firstDate}`
    : `${normalizedDates.length} tanggal transaksi: ${firstDate} - ${lastDate}`;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 0) return "Baru saja";
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

const STATUS_CFG = {
  pending: {
    label: "Menunggu",
    color: "text-orange-500 bg-orange-50 border border-orange-100",
  },
  diproses: {
    label: "Diproses",
    color: "text-blue-600  bg-blue-50   border border-blue-100",
  },
  dikirim: {
    label: "Dikirim",
    color: "text-violet-600 bg-violet-50 border border-violet-100",
  },
  selesai: {
    label: "Selesai",
    color: "text-emerald-600 bg-emerald-50  border border-emerald-100",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "text-red-500   bg-red-50    border border-red-100",
  },
};

const AKTIVITAS_DOT = {
  pesanan: "bg-emerald-500", // Hijau di Figma
  produk: "bg-blue-500", // Biru di Figma
  stok: "bg-orange-500", // Oranye di Figma
  batal: "bg-red-500", // Merah di Figma
};

const KATEGORI_COLORS = ["#2563EB", "#3B82F6", "#F97316", "#22C55E", "#A855F7"];

const getLatestOrderStatusConfig = (order) => {
  if (!order) {
    return {
      label: "-",
      color: "text-slate-500 bg-slate-50 border border-slate-200",
    };
  }

  const paymentStatus = String(order.status_bayar || "").toLowerCase();
  const orderStatus = String(order.status_order || "").toLowerCase();

  if (paymentStatus === "pending") return STATUS_CFG.pending;
  if (paymentStatus === "failed" || paymentStatus === "expired") return STATUS_CFG.dibatalkan;

  return STATUS_CFG[orderStatus] || STATUS_CFG.pending;
};

const buildRevenueChartPath = (data, width = 520, height = 220) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const points = [...data].reverse();
  const maxValue = Math.max(...points.map((item) => Number(item.total || 0)), 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : width / 2;

  return points
    .map((item, index) => {
      const x = points.length > 1 ? index * stepX : width / 2;
      const y = height - (Number(item.total || 0) / maxValue) * (height - 24) - 12;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const buildRevenueAreaPath = (data, width = 520, height = 220) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const points = [...data].reverse();
  const maxValue = Math.max(...points.map((item) => Number(item.total || 0)), 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : width / 2;

  const pointCoordinates = points.map((item, index) => {
    const x = points.length > 1 ? index * stepX : width / 2;
    const y = height - (Number(item.total || 0) / maxValue) * (height - 24) - 12;
    return { x, y };
  });

  const linePath = pointCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const lastX = pointCoordinates[pointCoordinates.length - 1]?.x ?? width;
  const firstX = pointCoordinates[0]?.x ?? 0;

  return `${linePath} L ${lastX} ${height} L ${firstX} ${height} Z`;
};

// ── Stat Card (UI Sesuai Figma) ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, badgeText }) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Badge Kanan Atas */}
      {badgeText && (
        <div className="absolute top-5 right-5 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
          {badgeText}
        </div>
      )}

      {/* Ikon */}
      <div className="mb-4">{icon}</div>

      {/* Teks */}
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-slate-800 leading-tight mb-2">
        {value}
      </p>
      <p className="text-[12px] font-medium text-slate-400">{sub}</p>
    </div>
  );
}

function QuickMenuCard({
  href,
  title,
  description,
  icon,
  accentClass,
  disabled = false,
  disabledLabel = "Segera hadir",
}) {
  const content = (
    <div
      className={`rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all ${
        disabled ? "cursor-not-allowed opacity-75" : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}>
        {icon}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            disabled ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"
          }`}
        >
          {disabled ? disabledLabel : "Buka"}
        </span>
      </div>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan.");

        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Gagal mengambil data dashboard");
        }

        if (!payload?.stats) {
          throw new Error("Data dashboard tidak valid");
        }

        setData(payload);
      } catch (fetchError) {
        setError(fetchError.message || "Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">
            Memuat data MGCCTV...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="text-center bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-500 font-bold mb-2 text-lg">
            Gagal Memuat Dashboard
          </p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const {
    stats,
    pendapatanHarian,
    kategoriTerlaris,
    pesananTerbaru,
    aktivitasTerkini,
  } = data;
  const revenueLinePath = buildRevenueChartPath(pendapatanHarian);
  const revenueAreaPath = buildRevenueAreaPath(pendapatanHarian);
  const revenueDateLabel = formatShortDateRange(
    pendapatanHarian.map((item) => item.tanggal)
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── HEADER (JUDUL, SEARCH & PROFILE) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        {/* Judul Halaman (Kiri Atas) */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-[14px] font-medium text-slate-500 mt-1">
            Ringkasan performa dan aktivitas toko
          </p>
        </div>

        {/* Search & Profil (Kanan Atas) */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <svg
              className="w-4 h-4 absolute left-4 top-2.5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari produk, pesanan..."
              className="w-full bg-blue-50/50 text-blue-900 placeholder:text-blue-400 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-blue-100/50"
            />
          </div>

          {/* BELL ICON & POPUP WRAPPER (Mulai Copy dari sini) */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className={`relative p-2.5 border rounded-full transition-colors shrink-0 ${showNotif ? "bg-blue-100 border-blue-200 text-blue-600" : "bg-blue-50/50 border-blue-100/50 text-blue-500 hover:bg-blue-100"}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/*KOTAK POPUP NOTIFIKASI */}
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Header Popup */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Notifikasi
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    3 Baru
                  </span>
                </div>

                {/* Isi Popup */}
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-800 leading-snug">
                        Pesanan baru #ORD-0187
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        Budi Santoso - 2x Hikvision DS-2CD2143G2-I - Total: Rp
                        2.500.000
                      </p>
                      <p className="text-[10px] font-semibold text-blue-500 mt-1.5">
                        5 menit lalu
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-800 leading-snug">
                        Stok hampir habis — DVR Dahua
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        Sisa stok: 3 unit. Segera lakukan restock.
                      </p>
                      <p className="text-[10px] font-semibold text-blue-500 mt-1.5">
                        1 jam lalu
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Popup */}
                <div className="p-3 border-t border-slate-100 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <a
                    href="/admin/notifikasi"
                    className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1"
                  >
                    Lihat Semua Notifikasi
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
          {/* END POPUP WRAPPER (Sampai Sini) */}

          {/* User Avatar */}
          <Link
            href="/admin/pengaturan"
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/20 shrink-0 cursor-pointer hover:bg-blue-700 hover:scale-105 transition-all duration-200"
          >
            A
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          }
          label="Total Pendapatan"
          value={
            stats.totalPendapatan >= 1_000_000
              ? `Rp ${(stats.totalPendapatan / 1_000_000).toFixed(0)} Jt`
              : formatRupiah(stats.totalPendapatan)
          }
          sub={`${stats.totalPesanan} transaksi tercatat di dashboard`}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          }
          label="Total Pesanan"
          value={stats.totalPesanan}
          sub={`${stats.pesananMenunggu} pesanan masih menunggu tindak lanjut`}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          }
          label="Produk Aktif"
          value={stats.produkAktif}
          sub={`${stats.produkHampirHabis} stok hampir habis`}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          }
          label="Pelanggan Baru"
          value={stats.totalPelanggan}
          sub={`Total ${stats.totalPelanggan} pengguna`}
        />
      </div>

      {/* ── ROW 2: Pendapatan Harian + Kategori Terlaris ── */}
      <div className="bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div>
          <h2 className="font-bold text-slate-800 text-base">Menu Cepat Admin</h2>
          <p className="text-[12px] font-medium text-blue-500 mt-1">
            Akses modul penting langsung dari dashboard
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <QuickMenuCard
            href="/admin/laporan-transaksi"
            title="Laporan Transaksi"
            description="Buka ringkasan omzet, histori transaksi, dan insight penjualan toko."
            accentClass="bg-blue-50 text-blue-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-6m4 6V7m4 10V4M5 20h14"
                />
              </svg>
            }
          />
          <QuickMenuCard
            href="/admin/pembelian"
            title="Pembelian"
            description="Buka halaman khusus pembelian untuk melihat ringkasan alur inventori berbasis stok produk."
            accentClass="bg-slate-100 text-slate-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 6h12M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Ringkasan Pendapatan Harian */}
        <div className="bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
          <h2 className="font-bold text-slate-800 text-base mb-1">
            Ringkasan Pendapatan Harian
          </h2>
          <p className="text-[12px] font-medium text-blue-500 mb-8">
            {revenueDateLabel}
          </p>

          {pendapatanHarian.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-sm">
                Belum ada pendapatan tercatat.
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-auto">
              <div className="rounded-[24px] border border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                      Grafik Omzet
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {formatRupiah(stats.totalPendapatan)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Total omzet dibaca dari detail transaksi yang sudah berhasil dibayar
                    </p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <div className="min-w-[520px]">
                    <svg viewBox="0 0 520 220" className="h-[220px] w-full">
                      <defs>
                        <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {[0, 1, 2, 3].map((line) => (
                        <line
                          key={line}
                          x1="0"
                          x2="520"
                          y1={20 + line * 50}
                          y2={20 + line * 50}
                          stroke="#dbeafe"
                          strokeDasharray="4 6"
                        />
                      ))}

                      {revenueAreaPath ? <path d={revenueAreaPath} fill="url(#revenueAreaFill)" /> : null}
                      {revenueLinePath ? (
                        <path
                          d={revenueLinePath}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : null}

                      {[...pendapatanHarian].reverse().map((item, index, arr) => {
                        const maxValue = Math.max(...arr.map((entry) => Number(entry.total || 0)), 1);
                        const stepX = arr.length > 1 ? 520 / (arr.length - 1) : 260;
                        const x = arr.length > 1 ? index * stepX : 260;
                        const y = 220 - (Number(item.total || 0) / maxValue) * (220 - 24) - 12;

                        return (
                          <g key={item.tanggal}>
                            <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
              {pendapatanHarian.map((d) => (
                <div key={d.tanggal} className="flex items-center gap-5">
                  <span className="text-[13px] font-medium text-slate-500 w-24 shrink-0">
                    {formatDate(d.tanggal)}
                  </span>
                  <div className="flex-1 bg-blue-50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 relative"
                      style={{ width: `${d.rasio}%` }}
                    ></div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 w-28 text-right shrink-0">
                    {formatRupiah(d.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kategori Terlaris */}
        <div className="bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col lg:w-[340px] xl:w-[380px]">
          <h2 className="font-bold text-slate-800 text-base mb-1">
            Kategori Terlaris
          </h2>
          <p className="text-[12px] font-medium text-blue-500 mb-5">
            Berdasarkan unit terjual ({stats.totalPesanan} total)
          </p>

          {kategoriTerlaris.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-sm">
                Belum ada data penjualan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {kategoriTerlaris.map((k, i) => (
                <div key={k.nama} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{
                          backgroundColor: KATEGORI_COLORS[i] ?? "#94A3B8",
                        }}
                      />
                      <span className="text-[13px] font-bold text-slate-700">
                        {k.nama}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">
                      {k.persen}%
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${k.persen}%`,
                        backgroundColor: KATEGORI_COLORS[i] ?? "#94A3B8",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: Pesanan Terbaru + Aktivitas Terkini ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pesanan Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                Pesanan Terbaru
              </h2>
              <p className="text-[12px] font-medium text-blue-500 mt-1">
                5 transaksi terakhir
              </p>
            </div>
            <a
              href="/admin/pesanan"
              className="text-[12px] font-bold text-blue-600 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              Lihat Semua{" "}
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {pesananTerbaru.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              Belum ada pesanan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b-2 border-slate-100">
                    <th className="pb-3 px-2">ID PESANAN</th>
                    <th className="pb-3 px-2">PELANGGAN</th>
                    <th className="pb-3 px-2">TOTAL</th>
                    <th className="pb-3 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pesananTerbaru.map((p) => {
                    const cfg = getLatestOrderStatusConfig(p);
                    return (
                      <tr
                        key={p.id_pesanan}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-4 px-2 font-bold text-slate-700">
                          #ORD-{String(p.id_pesanan).padStart(4, "0")}
                        </td>
                        <td className="py-4 px-2 text-[13px] font-medium text-slate-600">
                          {p.nama_pelanggan}
                        </td>
                        <td className="py-4 px-2 text-[13px] font-medium text-slate-600">
                          {formatRupiah(p.total_harga)}
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aktivitas Terkini */}
        <div className="bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <h2 className="font-bold text-slate-800 text-base mb-1">
            Aktivitas Terkini
          </h2>
          <div className="mb-8" />{" "}
          {/* Spacer untuk menyamakan tinggi header dengan sebelahnya */}
          {aktivitasTerkini.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              Belum ada aktivitas.
            </p>
          ) : (
            <div className="space-y-0">
              {aktivitasTerkini.map((a, i) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline Line & Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm border-2 border-white ${AKTIVITAS_DOT[a.tipe] ?? "bg-slate-400"}`}
                    />
                    {i < aktivitasTerkini.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6">
                    <p className="text-[13px] font-medium text-slate-700 leading-snug">
                      {a.keterangan}
                    </p>
                    <p className="text-[11px] font-medium text-blue-500 mt-1.5">
                      {formatTimeAgo(a.waktu)}{" "}
                      <span className="text-slate-300 mx-1">•</span>{" "}
                      <span className="text-slate-500">{a.aktor}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
