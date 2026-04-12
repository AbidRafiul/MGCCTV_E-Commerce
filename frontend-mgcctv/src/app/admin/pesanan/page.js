"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Loader2,
  Package,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

const PAGE_SIZE = 10;

const ORDER_STATUS_LABELS = {
  pending: "Menunggu",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const LABEL_TO_STATUS = {
  Menunggu: "pending",
  Diproses: "diproses",
  Dikirim: "dikirim",
  Selesai: "selesai",
  Dibatalkan: "dibatalkan",
};

const STATUS_OPTIONS = [
  { value: "Menunggu", label: "Menunggu", icon: Clock },
  { value: "Diproses", label: "Diproses", icon: ShieldCheck },
  { value: "Dikirim", label: "Dikirim", icon: Truck },
  { value: "Selesai", label: "Selesai", icon: CheckCircle2 },
  { value: "Dibatalkan", label: "Dibatalkan", icon: XCircle },
];

const STATUS_META = {
  Menunggu: {
    badgeClass: "bg-orange-50 border border-orange-100 text-orange-600",
    icon: Clock,
    accentClass: "border-orange-200 bg-orange-50 text-orange-700",
    primaryAction: {
      label: "Konfirmasi",
      nextStatus: "Diproses",
      icon: Check,
      className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    },
  },
  Diproses: {
    badgeClass: "bg-blue-50 border border-blue-100 text-blue-600",
    icon: ShieldCheck,
    accentClass: "border-blue-200 bg-blue-50 text-blue-700",
    primaryAction: {
      label: "Kirim",
      nextStatus: "Dikirim",
      icon: Package,
      className:
        "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm",
    },
  },
  Dikirim: {
    badgeClass: "bg-violet-50 border border-violet-100 text-violet-600",
    icon: Truck,
    accentClass: "border-violet-200 bg-violet-50 text-violet-700",
    primaryAction: {
      label: "Selesaikan",
      nextStatus: "Selesai",
      icon: CheckCircle2,
      className:
        "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm",
    },
  },
  Selesai: {
    badgeClass: "bg-green-50 border border-green-100 text-green-600",
    icon: CheckCircle2,
    accentClass: "border-green-200 bg-green-50 text-green-700",
  },
  Dibatalkan: {
    badgeClass: "bg-red-50 border border-red-100 text-red-600",
    icon: XCircle,
    accentClass: "border-red-200 bg-red-50 text-red-700",
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const mapOrderFromApi = (order) => ({
  id: `#ORD-${String(order.id_pesanan).padStart(4, "0")}`,
  id_pesanan: order.id_pesanan,
  date: formatDate(order.created_at),
  customer: order.nama_pelanggan || "Pelanggan",
  city: order.alamat_pelanggan || "-",
  product: order.produk_ringkas || "-",
  total: formatCurrency(order.total_harga),
  method: order.metode_bayar || "-",
  status: ORDER_STATUS_LABELS[order.status_order] || order.status_order,
  totalItem: Number(order.total_item || 0),
});

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  const Icon = meta?.icon || Clock;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit ${meta?.badgeClass || "bg-slate-50 border border-slate-200 text-slate-600"}`}
    >
      <Icon size={12} />
      <span className="text-[11px] font-bold">{status}</span>
    </div>
  );
}

function ActionButtons({
  order,
  onChangeStatus,
  isMenuOpen,
  onToggleMenu,
  isUpdating,
}) {
  const meta = STATUS_META[order.status];
  const primaryAction = meta?.primaryAction;

  return (
    <div className="relative flex items-center gap-2">
      {primaryAction ? (
        <button
          onClick={() => onChangeStatus(order.id_pesanan, primaryAction.nextStatus)}
          disabled={isUpdating}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${primaryAction.className}`}
        >
          {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <primaryAction.icon size={12} />}
          {primaryAction.label}
        </button>
      ) : (
        <div
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-bold ${meta?.accentClass || "border-slate-200 bg-slate-50 text-slate-600"}`}
        >
          <meta.icon size={12} />
          Tidak Ada Aksi
        </div>
      )}

      <button
        onClick={() => onToggleMenu(order.id_pesanan)}
        disabled={isUpdating}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <ChevronDown size={12} />
        Pilih Aksi
      </button>

      <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
        <Eye size={12} />
        Detail
      </button>

      {isMenuOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Ubah Status
          </p>
          <div className="mt-1 space-y-1">
            {STATUS_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              const isActive = option.value === order.status;

              return (
                <button
                  key={option.value}
                  onClick={() => onChangeStatus(order.id_pesanan, option.value)}
                  disabled={isUpdating}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <OptionIcon size={14} />
                    {option.label}
                  </span>
                  {isActive ? <Check size={14} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PesananPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const wrapperRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/pesanan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(payload?.message || "Gagal mengambil data pesanan");
      }

      setOrders(Array.isArray(payload) ? payload.map(mapOrderFromApi) : []);
    } catch (error) {
      Swal.fire({
        title: "Pesanan Gagal Dimuat",
        text: error.message || "Terjadi kesalahan saat mengambil data pesanan.",
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesTab = activeTab === "Semua" || order.status === activeTab;
      const matchesSearch =
        !keyword ||
        order.id.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword) ||
        order.product.toLowerCase().includes(keyword);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, orders, search]);

  const counts = useMemo(() => {
    const result = {
      semua: orders.length,
      Menunggu: 0,
      Diproses: 0,
      Dikirim: 0,
      Selesai: 0,
      Dibatalkan: 0,
    };

    orders.forEach((order) => {
      result[order.status] += 1;
    });

    return result;
  }, [orders]);

  const summaryCards = [
    {
      label: "Menunggu Konfirmasi",
      value: counts.Menunggu,
      icon: Clock,
      wrapClass: "bg-orange-50 text-orange-500",
    },
    {
      label: "Sedang Diproses",
      value: counts.Diproses + counts.Dikirim,
      icon: Truck,
      wrapClass: "bg-blue-50 text-blue-500",
    },
    {
      label: "Selesai / Diterima",
      value: counts.Selesai,
      icon: CheckCircle2,
      wrapClass: "bg-green-50 text-green-500",
    },
    {
      label: "Dibatalkan",
      value: counts.Dibatalkan,
      icon: XCircle,
      wrapClass: "bg-red-50 text-red-500",
    },
  ];

  const tabs = [
    `Semua (${counts.semua})`,
    `Menunggu (${counts.Menunggu})`,
    `Diproses (${counts.Diproses})`,
    `Dikirim (${counts.Dikirim})`,
    `Selesai (${counts.Selesai})`,
    `Dibatalkan (${counts.Dibatalkan})`,
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleChangeStatus = async (orderId, nextStatusLabel) => {
    const dbStatus = LABEL_TO_STATUS[nextStatusLabel];

    if (!dbStatus) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/pesanan/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status_order: dbStatus,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Gagal memperbarui status pesanan");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id_pesanan === orderId
            ? { ...order, status: nextStatusLabel }
            : order,
        ),
      );

      setOpenActionMenu(null);

      await Swal.fire({
        title: "Status Berhasil Diperbarui",
        text:
          nextStatusLabel === "Selesai"
            ? "Pesanan diselesaikan dan stok produk sudah disesuaikan."
            : payload?.message || "Status pesanan berhasil diperbarui.",
        icon: "success",
        confirmButtonColor: "#0C2C55",
      });
    } catch (error) {
      Swal.fire({
        title: "Status Gagal Diperbarui",
        text: error.message || "Terjadi kesalahan saat memperbarui status.",
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleActionMenu = (orderId) => {
    setOpenActionMenu((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div ref={wrapperRef} className="p-5 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.wrapClass}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  {item.label}
                </p>
                <p className="text-xl font-bold text-[#0C2C55]">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center overflow-x-auto border-b border-slate-200 hide-scrollbar bg-slate-50/50">
          {tabs.map((tab) => {
            const tabLabel = tab.split(" ")[0];
            const isActive = activeTab === tabLabel;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabLabel)}
                className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID pesanan / pelanggan..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-32">
                <input
                  type="text"
                  value="Terhubung"
                  readOnly
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                />
                <Calendar
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative flex-1 sm:w-32">
                <input
                  type="text"
                  value="Realtime"
                  readOnly
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                />
                <Calendar
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 w-full lg:w-auto shadow-sm">
            <Download size={14} /> Export Excel
          </button>
        </div>

        <div className="p-4 pb-0 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0C2C55] flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            Daftar Pesanan
          </h2>
          <span className="text-[11px] text-slate-500">
            Menampilkan {filteredOrders.length} pesanan
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
            <Loader2 className="animate-spin" size={18} />
            <span>Memuat pesanan dari backend...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      ID
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tanggal
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Pelanggan
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Produk
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Metode
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                        Belum ada pesanan yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr
                        key={order.id_pesanan}
                        className="hover:bg-slate-50/50 transition-colors align-top"
                      >
                        <td className="py-4 px-4 text-xs font-bold text-[#0C2C55] whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="py-4 px-4 text-xs text-blue-500 font-medium whitespace-nowrap">
                          {order.date}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-xs font-semibold text-slate-700">
                            {order.customer}
                          </p>
                          <p className="text-[10px] text-blue-500">{order.city}</p>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 min-w-[220px]">
                          {order.product}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-800 whitespace-nowrap">
                          {order.total}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {order.method}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <ActionButtons
                            order={order}
                            onChangeStatus={handleChangeStatus}
                            isMenuOpen={openActionMenu === order.id_pesanan}
                            onToggleMenu={toggleActionMenu}
                            isUpdating={updatingOrderId === order.id_pesanan}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <p className="text-[11px] text-slate-500">
                Menampilkan <span className="font-bold">{paginatedOrders.length}</span> dari{" "}
                <span className="font-bold">{filteredOrders.length}</span> pesanan
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
