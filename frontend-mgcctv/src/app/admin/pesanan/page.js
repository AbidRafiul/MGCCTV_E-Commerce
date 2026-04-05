"use client";

import { useState } from "react";
import { 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Calendar, 
  ChevronDown, 
  Download,
  Check,
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// --- DUMMY DATA PESANAN ---
const dummyOrders = [
  {
    id: "#ORD-0187",
    date: "12 Mar 2026",
    customer: "Budi Santoso",
    city: "Surabaya",
    product: "Hikvision DS-2CD2143G2 (x2)",
    total: "Rp 2.500.000",
    method: "Transfer BCA",
    status: "Menunggu",
  },
  {
    id: "#ORD-0186",
    date: "12 Mar 2026",
    customer: "Siti Rahayu",
    city: "Madiun",
    product: "Dahua IPC-HDW2831T-AS (x1)",
    total: "Rp 980.000",
    method: "GoPay",
    status: "Diproses",
  },
  {
    id: "#ORD-0185",
    date: "11 Mar 2026",
    customer: "Andi Wijaya",
    city: "Ponorogo",
    product: "Paket DVR Hikvision 8Ch + 4 Kamera",
    total: "Rp 5.600.000",
    method: "Transfer BNI",
    status: "Selesai",
  },
];

export default function PesananPage() {
  const [activeTab, setActiveTab] = useState("Semua");

  // Komponen untuk Status Badge (Pill)
  const StatusBadge = ({ status }) => {
    switch (status) {
      case "Menunggu":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 w-fit">
            <Clock size={12} />
            <span className="text-[11px] font-bold">Menunggu</span>
          </div>
        );
      case "Diproses":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 w-fit">
            <Truck size={12} />
            <span className="text-[11px] font-bold">Diproses</span>
          </div>
        );
      case "Selesai":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 w-fit">
            <CheckCircle2 size={12} />
            <span className="text-[11px] font-bold">Selesai</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Komponen untuk Action Buttons
  const ActionButtons = ({ status }) => {
    return (
      <div className="flex items-center gap-2">
        {status === "Menunggu" && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md transition-colors shadow-sm">
            <Check size={12} /> Konfirmasi
          </button>
        )}
        {status === "Diproses" && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-[11px] font-bold rounded-md transition-colors shadow-sm">
            <Package size={12} /> Kirim
          </button>
        )}
        <button className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md transition-colors shadow-sm">
          Detail
        </button>
      </div>
    );
  };

  return (
    <div className="p-5 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Menunggu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Menunggu Konfirmasi</p>
            <p className="text-xl font-bold text-[#0C2C55]">8</p>
          </div>
        </div>

        {/* Card: Diproses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Sedang Diproses</p>
            <p className="text-xl font-bold text-[#0C2C55]">14</p>
          </div>
        </div>

        {/* Card: Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Selesai / Diterima</p>
            <p className="text-xl font-bold text-[#0C2C55]">152</p>
          </div>
        </div>

        {/* Card: Dibatalkan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Dibatalkan</p>
            <p className="text-xl font-bold text-[#0C2C55]">13</p>
          </div>
        </div>
      </div>

      {/* 2. MAIN TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* TABS */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200 hide-scrollbar bg-slate-50/50">
          {["Semua (187)", "Menunggu (8)", "Diproses (14)", "Selesai (152)", "Dibatalkan (13)"].map((tab) => {
            const isActive = activeTab === tab.split(" ")[0]; // Cek kata pertama saja
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.split(" ")[0])}
                className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  isActive 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* FILTERS & SEARCH */}
        <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="ID pesanan / pelanggan..." 
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-32">
                <input 
                  type="text" 
                  defaultValue="03/01/2026" 
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative flex-1 sm:w-32">
                <input 
                  type="text" 
                  defaultValue="03/12/2026" 
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Dropdown Metode */}
            <button className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 rounded-lg w-full sm:w-36 text-xs text-slate-600 hover:bg-slate-50 bg-white">
              <span>Semua Metode</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>

          {/* Export Button */}
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 w-full lg:w-auto shadow-sm">
            <Download size={14} /> Export Excel
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0C2C55] flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            Daftar Pesanan
          </h2>
          <span className="text-[11px] text-slate-500">Menampilkan 187 pesanan</span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pelanggan</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Produk</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Metode</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dummyOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-xs font-bold text-[#0C2C55] whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-4 text-xs text-blue-500 font-medium whitespace-nowrap">{order.date}</td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-semibold text-slate-700">{order.customer}</p>
                    <p className="text-[10px] text-blue-500">{order.city}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 min-w-[200px]">{order.product}</td>
                  <td className="py-3 px-4 text-xs font-bold text-slate-800 whitespace-nowrap">{order.total}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{order.method}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <ActionButtons status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <p className="text-[11px] text-slate-500">
            Menampilkan <span className="font-bold">3</span> dari <span className="font-bold">187</span> pesanan
          </p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white text-[11px] font-bold">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold">3</button>
            <span className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs">...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold">19</button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}