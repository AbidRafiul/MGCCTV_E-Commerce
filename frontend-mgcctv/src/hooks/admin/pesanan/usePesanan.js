import { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";
import { Clock, ShieldCheck, Truck, CheckCircle2, XCircle, Check, Package } from "lucide-react";

export const PAGE_SIZE = 10;

const ORDER_STATUS_LABELS = { pending: "Menunggu", diproses: "Diproses", dikirim: "Dikirim", selesai: "Selesai", dibatalkan: "Dibatalkan" };
const LABEL_TO_STATUS = { Menunggu: "pending", Diproses: "diproses", Dikirim: "dikirim", Selesai: "selesai", Dibatalkan: "dibatalkan" };

export const STATUS_OPTIONS = [
  { value: "Menunggu", label: "Menunggu", icon: Clock },
  { value: "Diproses", label: "Diproses", icon: ShieldCheck },
  { value: "Dikirim", label: "Dikirim", icon: Truck },
  { value: "Selesai", label: "Selesai", icon: CheckCircle2 },
  { value: "Dibatalkan", label: "Dibatalkan", icon: XCircle },
];

export const STATUS_META = {
  Menunggu: { badgeClass: "bg-orange-50 border border-orange-100 text-orange-600", icon: Clock, accentClass: "border-orange-200 bg-orange-50 text-orange-700", primaryAction: { label: "Konfirmasi", nextStatus: "Diproses", icon: Check, className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" } },
  Diproses: { badgeClass: "bg-blue-50 border border-blue-100 text-blue-600", icon: ShieldCheck, accentClass: "border-blue-200 bg-blue-50 text-blue-700", primaryAction: { label: "Kirim", nextStatus: "Dikirim", icon: Package, className: "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm" } },
  Dikirim: { badgeClass: "bg-violet-50 border border-violet-100 text-violet-600", icon: Truck, accentClass: "border-violet-200 bg-violet-50 text-violet-700", primaryAction: { label: "Selesaikan", nextStatus: "Selesai", icon: CheckCircle2, className: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm" } },
  Selesai: { badgeClass: "bg-green-50 border border-green-100 text-green-600", icon: CheckCircle2, accentClass: "border-green-200 bg-green-50 text-green-700" },
  Dibatalkan: { badgeClass: "bg-red-50 border border-red-100 text-red-600", icon: XCircle, accentClass: "border-red-200 bg-red-50 text-red-700" },
};

const formatCurrency = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value) || 0);
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const mapOrderFromApi = (order) => ({
  id: `#ORD-${String(order.id_pesanan).padStart(4, "0")}`, id_pesanan: order.id_pesanan,
  date: formatDate(order.tanggal_transaksi), customer: order.nama_pelanggan || "Pelanggan",
  city: order.alamat_pelanggan || "-", product: order.produk_ringkas || "-",
  total: formatCurrency(order.total_harga), method: order.metode_bayar || "-",
  status: ORDER_STATUS_LABELS[order.status_order] || order.status_order,
  totalItem: Number(order.total_item || 0),
  rawDate: order.tanggal_transaksi || order.created_at || null,
  rawTotal: Number(order.total_harga || 0),
});

export const usePesanan = () => {
  const today = new Date();
  const defaultEndDate = today.toISOString().slice(0, 10);
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [activeDateFilters, setActiveDateFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const wrapperRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/pesanan`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload?.message || "Gagal mengambil data pesanan");
      setOrders(Array.isArray(payload) ? payload.map(mapOrderFromApi) : []);
    } catch (error) {
      Swal.fire({ title: "Pesanan Gagal Dimuat", text: error.message, icon: "error", confirmButtonColor: "#0C2C55" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpenActionMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTab = activeTab === "Semua" || order.status === activeTab;
      const matchesSearch = !keyword || order.id.toLowerCase().includes(keyword) || order.customer.toLowerCase().includes(keyword) || order.product.toLowerCase().includes(keyword);
      const normalizedOrderDate = formatDateInputValue(order.rawDate);
      const matchesStartDate = !activeDateFilters.startDate || (normalizedOrderDate && normalizedOrderDate >= activeDateFilters.startDate);
      const matchesEndDate = !activeDateFilters.endDate || (normalizedOrderDate && normalizedOrderDate <= activeDateFilters.endDate);
      return matchesTab && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [activeTab, activeDateFilters.endDate, activeDateFilters.startDate, orders, search]);

  const counts = useMemo(() => {
    const result = { semua: orders.length, Menunggu: 0, Diproses: 0, Dikirim: 0, Selesai: 0, Dibatalkan: 0 };
    orders.forEach((order) => { result[order.status] += 1; });
    return result;
  }, [orders]);

  const summaryCards = [
    { label: "Menunggu Konfirmasi", value: counts.Menunggu, icon: Clock, wrapClass: "bg-orange-50 text-orange-500" },
    { label: "Sedang Diproses", value: counts.Diproses + counts.Dikirim, icon: Truck, wrapClass: "bg-blue-50 text-blue-500" },
    { label: "Selesai / Diterima", value: counts.Selesai, icon: CheckCircle2, wrapClass: "bg-green-50 text-green-500" },
    { label: "Dibatalkan", value: counts.Dibatalkan, icon: XCircle, wrapClass: "bg-red-50 text-red-500" },
  ];

  const tabs = [
    `Semua (${counts.semua})`, `Menunggu (${counts.Menunggu})`, `Diproses (${counts.Diproses})`,
    `Dikirim (${counts.Dikirim})`, `Selesai (${counts.Selesai})`, `Dibatalkan (${counts.Dibatalkan})`,
  ];

  useEffect(() => { setCurrentPage(1); }, [activeTab, search, activeDateFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const applyDateFilter = () => {
    setActiveDateFilters({
      startDate,
      endDate,
    });
  };

  const resetDateFilter = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setActiveDateFilters({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });
  };

  const exportDateLabel = useMemo(() => {
    if (!activeDateFilters.startDate || !activeDateFilters.endDate) return "Semua tanggal";

    const startLabel = new Date(activeDateFilters.startDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const endLabel = new Date(activeDateFilters.endDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${startLabel} - ${endLabel}`;
  }, [activeDateFilters.endDate, activeDateFilters.startDate]);

  const handleExportExcel = async () => {
    if (filteredOrders.length === 0) {
      await Swal.fire({
        title: "Data Kosong",
        text: "Tidak ada pesanan yang bisa diexport untuk filter saat ini.",
        icon: "warning",
        confirmButtonColor: "#0C2C55",
      });
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import("xlsx");

      const workbook = XLSX.utils.book_new();
      const worksheetData = filteredOrders.map((order, index) => ({
        "No": index + 1,
        "ID Pesanan": order.id,
        "Tanggal Pesanan": order.date,
        "Nama Pelanggan": order.customer,
        "Alamat": order.city,
        "Produk": order.product,
        "Jumlah Item": order.totalItem,
        "Total Bayar": order.rawTotal,
        "Metode Bayar": order.method,
        "Status": order.status,
        "Periode Filter": exportDateLabel,
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pesanan");

      const filename = `laporan-pesanan_${activeDateFilters.startDate || "semua"}_${activeDateFilters.endDate || "semua"}.xlsx`;
      const workbookBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([workbookBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      await Swal.fire({
        title: "Export Berhasil",
        text: `File ${filename} berhasil disiapkan.`,
        icon: "success",
        confirmButtonColor: "#0C2C55",
      });
    } catch (error) {
      await Swal.fire({
        title: "Export Gagal",
        text: error.message || "Gagal mengekspor data pesanan.",
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangeStatus = async (orderId, nextStatusLabel) => {
    const dbStatus = LABEL_TO_STATUS[nextStatusLabel];
    if (!dbStatus) return;

    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/pesanan/${orderId}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_order: dbStatus }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Gagal memperbarui status");

      setOrders((prev) => prev.map((order) => order.id_pesanan === orderId ? { ...order, status: nextStatusLabel } : order));
      setOpenActionMenu(null);
      await Swal.fire({
        title: "Status Berhasil Diperbarui",
        text: nextStatusLabel === "Selesai" ? "Pesanan diselesaikan dan stok disesuaikan." : payload?.message,
        icon: "success", confirmButtonColor: "#0C2C55"
      });
    } catch (error) {
      Swal.fire({ title: "Gagal Diperbarui", text: error.message, icon: "error", confirmButtonColor: "#0C2C55" });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleActionMenu = (orderId) => setOpenActionMenu((prev) => (prev === orderId ? null : orderId));

  return {
    wrapperRef, loading, isExporting, summaryCards, tabs, activeTab, setActiveTab, search, setSearch,
    startDate, setStartDate, endDate, setEndDate, applyDateFilter, resetDateFilter, exportDateLabel, handleExportExcel,
    filteredOrders, paginatedOrders, currentPage, setCurrentPage, totalPages,
    openActionMenu, toggleActionMenu, updatingOrderId, handleChangeStatus
  };
};
