"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock3,
  Home,
  Loader2,
  Package,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import NavBox from "@/components/profile/NavBox"; // Pastikan path NavBox benar

const STATUS_META = {
  pending: { label: "Menunggu", statusClass: "border-blue-100 bg-blue-50 text-blue-700", icon: Clock3, accentClass: "from-blue-500/12 to-cyan-400/5" },
  diproses: { label: "Diproses", statusClass: "border-sky-100 bg-sky-50 text-sky-700", icon: Package, accentClass: "from-sky-500/12 to-cyan-400/5" },
  dikirim: { label: "Dikirim", statusClass: "border-orange-100 bg-orange-50 text-orange-700", icon: Truck, accentClass: "from-orange-500/12 to-amber-400/5" },
  selesai: { label: "Selesai", statusClass: "border-emerald-100 bg-emerald-50 text-emerald-700", icon: PackageCheck, accentClass: "from-emerald-500/12 to-lime-400/5" },
  dibatalkan: { label: "Dibatalkan", statusClass: "border-red-100 bg-red-50 text-red-700", icon: XCircle, accentClass: "from-red-500/12 to-rose-400/5" },
};

const PAYMENT_STATUS_LABELS = {
  pending: "Menunggu Pembayaran", paid: "Berhasil Dibayar", settlement: "Berhasil Dibayar", capture: "Pembayaran Terkonfirmasi",
  expire: "Kedaluwarsa", expired: "Kedaluwarsa", cancel: "Dibatalkan", deny: "Ditolak", failure: "Gagal", failed: "Gagal",
};

const formatCurrency = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value) || 0);
const formatDate = (value) => value ? new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-";
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  const formattedDate = date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(":", ".");
  return `${formattedDate}, ${formattedTime}`;
};

export default function HistorySection({
  orders, summary, isLoading, expandedOrderId, setExpandedOrderId, handleNavigate, summaryCards, isGoogleAccount
}) {
  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-32 md:px-8 sm:pt-36 lg:px-16">
      <div className="mx-auto max-w-5xl relative">
        <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
          <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
            Riwayat Pesanan
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Pesanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Saya</span>
          </h1>

          <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
            <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
              <Home size={14} className="mb-[1px]" /> Beranda
            </Link>
            <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
            <Link href="/riwayat" className="hover:text-blue-600 transition-colors shrink-0">Riwayat Pesanan</Link>
          </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          
          {/* INI BAGIAN YANG DIPERBAIKI: */}
          <NavBox activeItem="orders" onNavigate={handleNavigate} canAccessPassword={!isGoogleAccount} />

          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
            {/* Header Riwayat */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] px-5 py-6 md:px-8 md:py-8">
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">Pesanan Saya</span>
                  <h3 className="mt-3 text-2xl font-bold text-white md:text-[30px]">Riwayat Belanja</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">Riwayat pesanan ini sekarang terhubung langsung ke transaksi dan detail transaksi dari database.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">Total Belanja</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{formatCurrency(summary.total_spent)}</p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className={`rounded-2xl border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] ${item.className}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                          <p className="mt-2 text-2xl font-extrabold">{item.value}</p>
                          <p className="mt-1 text-sm opacity-75">{item.note}</p>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}><Icon size={20} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isLoading ? (
                <div className="mt-6 flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-14 text-slate-500">
                  <Loader2 className="animate-spin" size={18} /> <span>Memuat riwayat pesanan...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-14 text-center">
                  <h4 className="text-lg font-bold text-[#0C2C55]">Belum ada riwayat pesanan</h4>
                  <p className="mt-2 text-sm text-slate-500">Pesanan Anda akan muncul di sini setelah transaksi berhasil dibuat.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => {
                    const meta = STATUS_META[order.status_order] || STATUS_META.pending;
                    const StatusIcon = meta.icon;
                    const firstProduct = order.items?.[0];
                    const isExpanded = expandedOrderId === order.id_pesanan;
                    const paymentStatusLabel = PAYMENT_STATUS_LABELS[order.status_bayar] || order.status_bayar || "-";
                    const productLabel = order.items?.length > 1 ? `${firstProduct?.nama_produk || "Produk"} +${order.items.length - 1} item lainnya` : firstProduct?.nama_produk || "Produk";

                    return (
                      <div key={order.id_pesanan} className={`overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br ${meta.accentClass} p-[1px]`}>
                        <div className="rounded-[23px] bg-white p-4 md:p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-inner overflow-hidden">
                                {firstProduct?.gambar_produk ? <img src={firstProduct.gambar_produk} alt={productLabel} className="h-full w-full object-contain" /> : <ShoppingBag size={28} />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-base font-bold text-[#0C2C55] md:text-lg">{productLabel}</p>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">#{String(order.id_pesanan).padStart(4, "0")}</span>
                                </div>
                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3 sm:gap-6">
                                  <p><span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Tanggal Transaksi</span><span className="mt-1 block font-medium text-slate-700">{formatDate(order.tanggal_transaksi)}</span></p>
                                  <p><span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Jumlah Item</span><span className="mt-1 block font-medium text-slate-700">{order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item</span></p>
                                  <p><span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Total Bayar</span><span className="mt-1 block font-semibold text-slate-900">{formatCurrency(order.total_harga)}</span></p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start gap-3 lg:items-end">
                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.statusClass}`}><StatusIcon size={14} /> {meta.label}</span>
                              <button type="button" onClick={() => setExpandedOrderId((prev) => prev === order.id_pesanan ? null : order.id_pesanan)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-xs font-semibold text-[#0C2C55] transition hover:bg-slate-200">
                                {isExpanded ? "Tutup Ringkasan" : "Lihat Ringkasan"} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="grid gap-3 md:grid-cols-4">
                                <div><p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">ID Transaksi</p><p className="mt-1 text-sm font-semibold text-slate-700">TRX-{String(order.id_pesanan).padStart(5, "0")}</p></div>
                                <div><p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Tanggal Transaksi</p><p className="mt-1 text-sm font-semibold text-slate-700">{formatDateTime(order.tanggal_transaksi)}</p></div>
                                <div><p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Metode Bayar</p><p className="mt-1 text-sm font-semibold text-slate-700">{order.metode_bayar || "-"}</p></div>
                                <div><p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Status Bayar</p><p className="mt-1 text-sm font-semibold text-slate-700">{paymentStatusLabel}</p></div>
                              </div>
                              <div className="mt-4 space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id_detail_transcation} className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3">
                                    <div className="min-w-0"><p className="text-sm font-semibold text-[#0C2C55]">{item.nama_produk}</p><p className="text-xs text-slate-500">{item.merek} | {item.quantity} x {formatCurrency(item.harga)}</p></div>
                                    <p className="shrink-0 text-sm font-bold text-slate-800">{formatCurrency(item.total)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Link href="/produk" className="inline-flex items-center gap-2 rounded-full bg-[#0C2C55] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#123d73]">Beli Lagi <ArrowUpRight size={14} /></Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}