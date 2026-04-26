import { useEffect, useState } from "react";
import {
  BadgeDollarSign, PackagePlus, ReceiptText,
  ShoppingBag, Wallet, History, UserCheck
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import Swal from "sweetalert2";

export const useLaporanTransaksi = () => {
  const today = new Date();
  const defaultEndDate = today.toISOString().slice(0, 10);
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const [activeTab, setActiveTab] = useState("penjualan");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [reportData, setReportData] = useState({
    salesCards: [],
    salesRows: [],
    salesInsights: [],
    restockCards: [],
    restockRows: [],
    restockInsights: [],
  });
  const [activeFilters, setActiveFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token admin tidak ditemukan.");

        const params = new URLSearchParams();
        if (activeFilters.startDate) params.set("start_date", activeFilters.startDate);
        if (activeFilters.endDate) params.set("end_date", activeFilters.endDate);

        const response = await fetch(`${API_BASE_URL}/api/admin/laporan-transaksi?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Gagal mengambil laporan transaksi");
        }

        setReportData({
          salesCards: Array.isArray(payload?.salesCards) ? payload.salesCards : [],
          salesRows: Array.isArray(payload?.salesRows) ? payload.salesRows : [],
          salesInsights: Array.isArray(payload?.salesInsights) ? payload.salesInsights : [],
          restockCards: Array.isArray(payload?.restockCards) ? payload.restockCards : [],
          restockRows: Array.isArray(payload?.restockRows) ? payload.restockRows : [],
          restockInsights: Array.isArray(payload?.restockInsights) ? payload.restockInsights : [],
        });
      } catch (fetchError) {
        setError(fetchError.message || "Gagal memuat laporan transaksi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [activeFilters]);

  const applyDateFilter = () => {
    setActiveFilters({
      startDate,
      endDate,
    });
  };

  const resetDateFilter = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setActiveFilters({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });
  };

  const formatDateRangeLabel = (start, end) => {
    if (!start || !end) return "Semua tanggal";

    const startLabel = new Date(start).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const endLabel = new Date(end).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${startLabel} - ${endLabel}`;
  };

  const sanitizeSheetName = (name) =>
    String(name || "Sheet").replace(/[\\/?*\[\]:]/g, " ").slice(0, 31);

  const formatFilenameDate = (value) =>
    String(value || "").trim() || new Date().toISOString().slice(0, 10);

  const exportReportToExcel = async () => {
    try {
      setIsExporting(true);
      const XLSX = await import("xlsx");
      const exportDateRangeLabel = formatDateRangeLabel(
        activeFilters.startDate,
        activeFilters.endDate
      );

      const workbook = XLSX.utils.book_new();

      const salesSummaryRows = reportData.salesCards.map((card) => ({
        "Metrik": card.title,
        "Nilai": card.value,
        "Catatan": card.note,
      }));

      const salesTransactionRows = reportData.salesRows.map((row) => ({
        "ID Transaksi": row.id,
        "Pelanggan": row.customer,
        "Channel": row.channel,
        "Ringkasan Item": row.items,
        "Total": row.total,
        "Metode Bayar": row.payment,
        "Status": row.status,
        "Tanggal": formatDateTime(row.date),
      }));

      const salesInsightRows = reportData.salesInsights.map((row) => ({
        "Produk": row.name,
        "Unit Terjual": row.sold,
        "Pendapatan": row.revenue,
        "Ringkasan": row.change,
      }));

      const restockSummaryRows = reportData.restockCards.map((card) => ({
        "Metrik": card.title,
        "Nilai": card.value,
        "Catatan": card.note,
      }));

      const restockTransactionRows = reportData.restockRows.map((row) => ({
        "ID Restok": row.id,
        "Produk": row.product,
        "Jumlah Masuk": row.jumlah,
        "Admin": row.admin,
        "Tanggal": formatDateTime(row.date),
      }));

      const restockInsightRows = reportData.restockInsights.map((row) => ({
        "Produk": row.name,
        "Total Restok": row.sold,
        "Ringkasan": row.change,
      }));

      const appendSheet = (sheetName, rows, fallbackRow) => {
        const worksheet = XLSX.utils.json_to_sheet(
          rows.length > 0 ? rows : [fallbackRow]
        );
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          sanitizeSheetName(sheetName)
        );
      };

      appendSheet("Ringkasan Penjualan", salesSummaryRows, {
        "Metrik": "Belum ada data",
        "Nilai": "-",
        "Catatan": exportDateRangeLabel,
      });
      appendSheet("Transaksi Penjualan", salesTransactionRows, {
        "ID Transaksi": "Belum ada data",
        "Pelanggan": "-",
        "Channel": "-",
        "Ringkasan Item": "-",
        "Total": 0,
        "Metode Bayar": "-",
        "Status": "-",
        "Tanggal": exportDateRangeLabel,
      });
      appendSheet("Insight Penjualan", salesInsightRows, {
        "Produk": "Belum ada data",
        "Unit Terjual": 0,
        "Pendapatan": 0,
        "Ringkasan": exportDateRangeLabel,
      });
      appendSheet("Ringkasan Restok", restockSummaryRows, {
        "Metrik": "Belum ada data",
        "Nilai": "-",
        "Catatan": exportDateRangeLabel,
      });
      appendSheet("Riwayat Restok", restockTransactionRows, {
        "ID Restok": "Belum ada data",
        "Produk": "-",
        "Jumlah Masuk": 0,
        "Admin": "-",
        "Tanggal": exportDateRangeLabel,
      });
      appendSheet("Insight Restok", restockInsightRows, {
        "Produk": "Belum ada data",
        "Total Restok": 0,
        "Ringkasan": exportDateRangeLabel,
      });

      const filename = `laporan-transaksi_${formatFilenameDate(activeFilters.startDate)}_${formatFilenameDate(activeFilters.endDate)}.xlsx`;
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
        confirmButtonText: "Oke",
        confirmButtonColor: "#0C2C55",
      });
    } catch (exportError) {
      console.error("Gagal export laporan transaksi:", exportError);
      await Swal.fire({
        title: "Export Gagal",
        text: exportError?.message || "Export Excel gagal. Coba ulangi lagi.",
        icon: "error",
        confirmButtonText: "Oke",
        confirmButtonColor: "#0C2C55",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // --- LOGIKA TAB ---
  const iconMap = {
    "Omzet Bulan Ini": Wallet,
    "Transaksi Berhasil": ReceiptText,
    "Produk Terjual": ShoppingBag,
    "Nilai Rata-rata": BadgeDollarSign,
    "Total Barang Masuk": PackagePlus,
    "Frekuensi Restok": History,
    "Produk Terbanyak": ShoppingBag,
    "Admin Teraktif": UserCheck,
  };

  const currentCards = (activeTab === "penjualan" ? reportData.salesCards : reportData.restockCards).map((card) => ({
    ...card,
    value:
      typeof card.value === "number"
        ? card.title === "Produk Terjual" || card.title === "Total Barang Masuk"
          ? `${new Intl.NumberFormat("id-ID").format(card.value)} Unit`
          : card.title === "Transaksi Berhasil" || card.title === "Frekuensi Restok"
            ? `${new Intl.NumberFormat("id-ID").format(card.value)} ${card.title === "Frekuensi Restok" ? "Kali" : "Pesanan"}`
          : formatCurrency(card.value)
        : card.value,
    icon: iconMap[card.title] || ShoppingBag,
  }));

  const currentTopProducts = activeTab === "penjualan" ? reportData.salesInsights : reportData.restockInsights;

  const toneStyles = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  const statusStyles = {
    Selesai: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Diproses: "bg-blue-50 text-blue-700 ring-blue-100",
    Dikirim: "bg-violet-50 text-violet-700 ring-violet-100",
    Menunggu: "bg-amber-50 text-amber-700 ring-amber-100",
    Dibatalkan: "bg-rose-50 text-rose-700 ring-rose-100",
    "Belum Lunas": "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return {
    isLoading, isExporting, error,
    startDate, setStartDate, endDate, setEndDate,
    applyDateFilter, resetDateFilter,
    exportReportToExcel,
    dateRangeLabel: formatDateRangeLabel(activeFilters.startDate, activeFilters.endDate),
    activeTab, setActiveTab,
    currentCards, currentTopProducts,
    transactions: reportData.salesRows,
    restockTransactions: reportData.restockRows,
    formatCurrency, toneStyles, statusStyles
  };
};
