"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(num)
    .replace("IDR", "Rp");

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
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
  pending:  { label: "Menunggu",   color: "text-orange-500 bg-orange-50 border border-orange-100" },
  paid:     { label: "Diproses",   color: "text-blue-600  bg-blue-50   border border-blue-100"   },
  expired:  { label: "Selesai",    color: "text-emerald-600 bg-emerald-50  border border-emerald-100"  },
  failed:   { label: "Dibatalkan", color: "text-red-500   bg-red-50    border border-red-100"    },
};

const AKTIVITAS_DOT = {
  pesanan: "bg-emerald-500", // Hijau di Figma
  produk:  "bg-blue-500",    // Biru di Figma
  stok:    "bg-orange-500",  // Oranye di Figma
  batal:   "bg-red-500"      // Merah di Figma
};

const KATEGORI_COLORS = ["#2563EB", "#3B82F6", "#F97316", "#22C55E", "#A855F7"];

// ── Stat Card (UI Sesuai Figma) ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, badgeText }) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
      
      {/* Badge Kanan Atas */}
      {badgeText && (
        <div className="absolute top-5 right-5 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          {badgeText}
        </div>
      )}

      {/* Ikon */}
      <div className="mb-4">{icon}</div>
      
      {/* Teks */}
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800 leading-tight mb-2">{value}</p>
      <p className="text-[12px] font-medium text-slate-400">{sub}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Token tidak ditemukan."); setLoading(false); return; }

    fetch(`${API_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.message && !d.stats) throw new Error(d.message);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Memuat data MGCCTV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="text-center bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-500 font-bold mb-2 text-lg">Gagal Memuat Dashboard</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { stats, pendapatanHarian, kategoriTerlaris, pesananTerbaru, aktivitasTerkini } = data;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

{/* ── HEADER (JUDUL, SEARCH & PROFILE) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        
        {/* Judul Halaman (Kiri Atas) */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-[14px] font-medium text-slate-500 mt-1">Ringkasan performa dan aktivitas toko</p>
        </div>
        
        {/* Search & Profil (Kanan Atas) */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-4 top-2.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari produk, pesanan..." 
              className="w-full bg-blue-50/50 text-blue-900 placeholder:text-blue-400 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-blue-100/50" 
            />
          </div>
          
          {/* Bell Icon */}
          <button className="relative p-2.5 bg-blue-50/50 border border-blue-100/50 rounded-full text-blue-500 hover:bg-blue-100 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/20 shrink-0 cursor-pointer">
            A
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
          }
          label="Total Pendapatan"
          value={stats.totalPendapatan >= 1_000_000 ? `Rp ${(stats.totalPendapatan / 1_000_000).toFixed(0)} Jt` : formatRupiah(stats.totalPendapatan)}
          sub="Maret 2026 - vs Rp 217 Jt Feb"
          badgeText="14.2%"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          }
          label="Total Pesanan"
          value={stats.totalPesanan}
          sub={`${stats.pesananMenunggu} menunggu konfirmasi`}
          badgeText="9.7%"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          }
          label="Produk Aktif"
          value={stats.produkAktif}
          sub={`${stats.produkHampirHabis} stok hampir habis`}
          badgeText="4"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          }
          label="Pelanggan Baru"
          value={stats.totalPelanggan}
          sub={`Total ${stats.totalPelanggan} pengguna`}
          badgeText="21.5%"
        />
      </div>

      {/* ── ROW 2: Pendapatan Harian + Kategori Terlaris ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Ringkasan Pendapatan Harian */}
        <div className="lg:col-span-2 bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
          <h2 className="font-bold text-slate-800 text-base mb-1">Ringkasan Pendapatan Harian</h2>
          <p className="text-[12px] font-medium text-blue-500 mb-8">
            {pendapatanHarian.length > 0
              ? `${pendapatanHarian.length} Hari Terakhir — Maret 2026`
              : "Belum ada data"}
          </p>
          
          {pendapatanHarian.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Belum ada pendapatan tercatat.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-auto">
              {pendapatanHarian.map((d) => (
                <div key={d.tanggal} className="flex items-center gap-5">
                  <span className="text-[13px] font-medium text-slate-500 w-24 shrink-0">{formatDate(d.tanggal)}</span>
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
        <div className="bg-white rounded-[20px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
          <h2 className="font-bold text-slate-800 text-base mb-1">Kategori Terlaris</h2>
          <p className="text-[12px] font-medium text-blue-500 mb-8">
            Berdasarkan unit terjual ({stats.totalPesanan} total)
          </p>
          
          {kategoriTerlaris.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Belum ada data penjualan.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-auto">
              {kategoriTerlaris.map((k, i) => (
                <div key={k.nama} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: KATEGORI_COLORS[i] ?? "#94A3B8" }}
                      />
                      <span className="text-[13px] font-bold text-slate-700">{k.nama}</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">{k.persen}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${k.persen}%`, backgroundColor: KATEGORI_COLORS[i] ?? "#94A3B8" }}
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
              <h2 className="font-bold text-slate-800 text-base">Pesanan Terbaru</h2>
              <p className="text-[12px] font-medium text-blue-500 mt-1">5 transaksi terakhir</p>
            </div>
            <a href="/admin/pesanan" className="text-[12px] font-bold text-blue-600 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1">
              Lihat Semua <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
          
          {pesananTerbaru.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada pesanan.</p>
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
                    const cfg = STATUS_CFG[p.status_order] ?? { label: p.status_order, color: "text-slate-500 bg-slate-50 border border-slate-200" };
                    return (
                      <tr key={p.id_pesanan} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-2 font-bold text-slate-700">
                          #ORD-{String(p.id_pesanan).padStart(4, "0")}
                        </td>
                        <td className="py-4 px-2 text-[13px] font-medium text-slate-600">{p.nama_pelanggan}</td>
                        <td className="py-4 px-2 text-[13px] font-medium text-slate-600">{formatRupiah(p.total_harga)}</td>
                        <td className="py-4 px-2">
                          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${cfg.color}`}>
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
          <h2 className="font-bold text-slate-800 text-base mb-1">Aktivitas Terkini</h2>
          <div className="mb-8" /> {/* Spacer untuk menyamakan tinggi header dengan sebelahnya */}
          
          {aktivitasTerkini.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-0">
              {aktivitasTerkini.map((a, i) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline Line & Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm border-2 border-white ${AKTIVITAS_DOT[a.tipe] ?? "bg-slate-400"}`} />
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
                      {formatTimeAgo(a.waktu)} <span className="text-slate-300 mx-1">•</span> <span className="text-slate-500">{a.aktor}</span>
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