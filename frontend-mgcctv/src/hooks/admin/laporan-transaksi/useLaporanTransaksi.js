import { useState } from "react";
import {
  BadgeDollarSign, PackagePlus, ReceiptText,
  ShoppingBag, Wallet, History, UserCheck
} from "lucide-react";

export const useLaporanTransaksi = () => {
  const [activeTab, setActiveTab] = useState("penjualan");

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

  // --- LOGIKA TAB ---
  const currentCards = activeTab === "penjualan" ? salesCards : restockCards;
  const currentTopProducts = activeTab === "penjualan" ? topProducts : [
    { name: "Hikvision Dome 2MP", sold: 25, revenue: 0, change: "Restok" },
    { name: "Power Supply 12V", sold: 15, revenue: 0, change: "Restok" },
    { name: "Kabel Coaxial 100m", sold: 10, revenue: 0, change: "Restok" },
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

  return {
    activeTab, setActiveTab,
    currentCards, currentTopProducts,
    transactions, restockTransactions,
    formatCurrency, toneStyles, statusStyles
  };
};