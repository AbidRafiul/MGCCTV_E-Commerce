"use client";

import Link from "next/link";
import { Home, ChevronRight, ReceiptText, ShieldCheck } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function TransaksiSection({
  checkoutItems,
  shippingProfile,
  isLoading,
  paymentDeadline,
  transactionData,
  totalAmount,
  paymentLabel,
  reviewStatus,
  statusConfig,
  handleRetryTransaction,
}) {
  const StatusIcon = statusConfig.icon;

  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-5xl relative">
        <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 mb-10 flex flex-col items-start gap-4 px-2 sm:px-4">
          <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 shadow-sm backdrop-blur-md sm:text-xs">
            Pesanan Anda
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Informasi{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Transaksi
            </span>
          </h1>

          <nav className="mt-2 flex w-full items-center overflow-x-auto rounded-full bg-white/80 px-4 py-2.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur-md [&::-webkit-scrollbar]:hidden sm:w-auto sm:text-sm">
            <Link
              href="/beranda"
              className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-blue-600"
            >
              <Home size={14} className="mb-[1px]" />
              Beranda
            </Link>
            <ChevronRight size={14} className="mx-2 shrink-0 text-slate-400" />
            <Link
              href="/produk"
              className="shrink-0 transition-colors hover:text-blue-600"
            >
              Produk
            </Link>
            <ChevronRight size={14} className="mx-2 shrink-0 text-slate-400" />
            <span className="max-w-[120px] shrink-0 truncate text-slate-900 sm:max-w-[300px]">
              Transaksi
            </span>
          </nav>
        </div>

        {isLoading ? (
          <div className="rounded-[24px] bg-white p-6 text-center shadow-sm sm:rounded-[28px] sm:p-8">
            <p className="text-sm font-medium text-slate-500 sm:text-base">
              Menyiapkan tampilan transaksi...
            </p>
          </div>
        ) : !transactionData ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-[28px] sm:px-6 sm:py-14">
            <h2 className="text-lg font-bold text-[#0C2C55] sm:text-xl">
              Belum ada transaksi yang dibuat
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Masuk dulu ke halaman detail pesanan untuk membuat transaksi dan membuka Snap Midtrans sandbox.
            </p>
            <Link
              href="/checkout"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Ke Detail Pesanan
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] p-5 text-white shadow-sm sm:rounded-[28px] sm:p-6">
                <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                      {statusConfig.heroBadge}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold md:text-[30px]">
                      {statusConfig.heroTitle}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                      {statusConfig.heroDescription}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                      Order ID
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      {transactionData.order_id || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <ReceiptText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-500">
                      Informasi Pembayaran
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Metode Pembayaran
                        </p>
                        <p className="mt-2 text-sm font-bold text-[#0C2C55]">
                          {paymentLabel}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          Pembayaran masih memakai environment sandbox agar aman untuk tahap pengembangan.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {reviewStatus === "success" ? "Waktu Pembayaran" : "Batas Waktu Pembayaran"}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#0C2C55]">
                          {reviewStatus === "success"
                            ? transactionData?.settlement_time || transactionData?.transaction_time || "-"
                            : paymentDeadline || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Tujuan Pengiriman
                    </p>
                    <p className="mt-1 text-base font-bold text-[#0C2C55]">
                      {shippingProfile?.nama || "Nama belum tersedia"}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                      {shippingProfile?.alamat || "Alamat pengiriman belum tersedia."}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {shippingProfile?.no_hp || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {checkoutItems.map((item) => (
                  <div
                    key={item.id_produk}
                    className="rounded-[22px] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2.5 sm:h-24 sm:w-24">
                        <img
                          src={item.gambar_produk || "/images/placeholder.jpg"}
                          alt={item.nama_produk}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600 sm:text-xs">
                          {item.merek}
                        </p>
                        <h2 className="text-base font-bold text-[#0C2C55] sm:text-lg">
                          {item.nama_produk}
                        </h2>
                        <div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
                          <p>
                            Jumlah: <span className="font-semibold">{item.quantity}</span>
                          </p>
                          <p>
                            Harga satuan:{" "}
                            <span className="font-semibold">
                              {formatCurrency(item.harga_produk)}
                            </span>
                          </p>
                        </div>
                        <p className="pt-1 text-sm font-extrabold text-[#0C2C55] sm:text-base">
                          Subtotal {formatCurrency(item.harga_produk * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-[24px] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0C2C55]">
                      Ringkasan Pembayaran
                    </h2>
                    <p className="text-sm text-slate-500">
                      Total {checkoutItems.length} produk dipilih
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Status</span>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.statusClass}`}>
                      <StatusIcon size={14} />
                      {statusConfig.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Metode bayar</span>
                    <span className="font-semibold text-[#0C2C55]">
                      {paymentLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Total bayar</span>
                    <span className="text-lg font-extrabold text-[#0C2C55]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {reviewStatus !== "success" ? (
                    <Link
                      href="/checkout"
                      onClick={handleRetryTransaction}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
                    >
                      Buat Transaksi Lagi
                    </Link>
                  ) : null}

                  <Link
                    href="/riwayat"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#0C2C55] transition-colors hover:bg-slate-50"
                  >
                    Lihat Riwayat Belanja
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}