"use client";

import Link from "next/link";
import Script from "next/script"; // 
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Copy,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  Home,
  ChevronRight,
  QrCode,
} from "lucide-react";
import Swal from "sweetalert2";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { AUTH_API_URL } from "@/lib/api";
import { getCheckoutItems } from "@/services/cartService";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const generateOrderId = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  return `TRX-${stamp}`;
};

export default function TransaksiPage() {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false); // 🟢 TAMBAHAN: State loading saat nembak API
  const [orderId, setOrderId] = useState("");
  const [paymentDeadline, setPaymentDeadline] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentBank, setPaymentBank] = useState("");

  useEffect(() => {
    const loadTransactionPreview = async () => {
      setIsLoading(true);

      try {
        setOrderId(generateOrderId());

        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setPaymentDeadline(
          deadline.toLocaleString("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          }),
        );

        setCheckoutItems(getCheckoutItems());

        if (typeof window !== "undefined") {
          const savedMethod =
            localStorage.getItem("selectedPaymentMethod") || "transfer";
          const savedBank = localStorage.getItem("selectedPaymentBank") || "";
          setPaymentMethod(savedMethod);
          setPaymentBank(savedBank);
        }

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setShippingProfile(null);
          return;
        }

        const response = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setShippingProfile(
            normalizeProfile(
              data?.user ?? data?.data?.user ?? data?.data ?? null,
            ),
          );
        }
      } catch (error) {
        console.error("Gagal memuat preview transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactionPreview();
  }, []);

  const totalAmount = useMemo(
    () =>
      checkoutItems.reduce(
        (total, item) =>
          total + Number(item.harga_produk || 0) * Number(item.quantity || 0),
        0,
      ),
    [checkoutItems],
  );

  const virtualAccount = useMemo(() => "8808123412345678", []);

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      Swal.fire({
        title: `${label} disalin`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal menyalin",
        text: `Silakan salin ${label.toLowerCase()} secara manual.`,
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    }
  };

  // =================================================================
  // 🟢 FUNGSI BARU: MEMANGGIL MIDTRANS SNAP
  // =================================================================
  const handleBayarMidtrans = async () => {
    setIsPaying(true);
    try {
      // 1. Tembak endpoint Backend Express.js kamu
      const response = await fetch("http://localhost:3000/api/payment/process", { // Sesuaikan URL backend kamu
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          totalAmount: totalAmount,
          customerDetails: {
            nama: shippingProfile?.nama || "Pelanggan MG CCTV",
            no_hp: shippingProfile?.no_hp || "08000000000",
          },
          items: checkoutItems.map(item => ({
            id_produk: item.id_produk,
            nama_produk: item.nama_produk,
            harga_produk: item.harga_produk,
            quantity: item.quantity
          }))
        }),
      });

      const data = await response.json();

      // 2. Jika dapat token, buka pop-up Snap Midtrans
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            Swal.fire("Berhasil!", "Pembayaran Anda telah diterima.", "success").then(() => {
              // Redirect ke riwayat atau kosongkan keranjang di sini
            });
          },
          onPending: function (result) {
            Swal.fire("Menunggu", "Silakan selesaikan pembayaran Anda.", "info");
          },
          onError: function (result) {
            Swal.fire("Gagal", "Terjadi kesalahan pada pembayaran.", "error");
          },
          onClose: function () {
            Swal.fire("Batal", "Anda menutup halaman pembayaran.", "warning");
          },
        });
      } else {
        Swal.fire("Error", "Gagal mendapatkan token pembayaran", "error");
      }
    } catch (error) {
      console.error("Gagal bayar:", error);
      Swal.fire("Error", "Gagal terhubung ke server", "error");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <AuthGuard>
      {/* 🟢 SCRIPT Wajib Midtrans */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="beforeInteractive"
      />

      <Navbar />
      <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-5xl relative">
          <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
            <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
              Pesanan Anda
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Detail{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Transaksi
              </span>
            </h1>

            <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
              <Link
                href="/beranda"
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0"
              >
                <Home size={14} className="mb-[1px]" />
                Beranda
              </Link>
              <ChevronRight
                size={14}
                className="mx-2 text-slate-400 shrink-0"
              />
              <Link
                href="/produk"
                className="hover:text-blue-600 transition-colors shrink-0"
              >
                Produk
              </Link>
              <ChevronRight
                size={14}
                className="mx-2 text-slate-400 shrink-0"
              />
              <span className="text-slate-900 truncate max-w-[120px] sm:max-w-[300px] shrink-0">
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
          ) : checkoutItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-[28px] sm:px-6 sm:py-14">
              <h2 className="text-lg font-bold text-[#0C2C55] sm:text-xl">
                Belum ada transaksi untuk ditampilkan
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Kembali ke halaman checkout dan pilih produk yang ingin Anda
                lanjutkan.
              </p>
              <Link
                href="/checkout"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
              >
                Kembali ke Checkout
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
                        Transaksi Saya
                      </span>
                      <h3 className="mt-3 text-2xl font-bold md:text-[30px]">
                        Selesaikan Pembayaran
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                        Klik tombol Lanjutkan Pembayaran di bawah untuk membuka sistem pembayaran resmi Midtrans.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                        ID Transaksi
                      </p>
                      <p className="mt-1 text-lg font-extrabold">{orderId}</p>
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
                        {paymentMethod === "qris" ? (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 mb-3 z-10">
                              Simulasi QRIS
                            </p>
                            <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-xl border-2 border-dashed border-blue-300 p-2 bg-white shadow-sm mb-2 z-10 opacity-50 grayscale">
                              <img
                                src="/images/qris-bri.jpg"
                                alt="QRIS Dummy"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs font-medium text-slate-500 z-10">
                              Klik tombol Lanjutkan Pembayaran untuk menampilkan QRIS asli.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Virtual Account {paymentBank && `(${paymentBank})`}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-lg font-extrabold text-slate-400">
                                -- Tersembunyi --
                              </p>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500 z-10">
                              Klik tombol Lanjutkan Pembayaran untuk mendapatkan Nomor VA asli.
                            </p>
                          </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Batas Pembayaran
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#0C2C55]">
                            {paymentDeadline}
                          </p>

                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                              Sistem Pembayaran didukung penuh oleh Midtrans yang dijamin aman dan otomatis terverifikasi.
                            </p>
                          </div>
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
                        {shippingProfile?.alamat ||
                          "Alamat pengiriman belum tersedia."}
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
                            src={
                              item.gambar_produk || "/images/placeholder.jpg"
                            }
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
                              Jumlah:{" "}
                              <span className="font-semibold">
                                {item.quantity}
                              </span>
                            </p>
                            <p>
                              Harga satuan:{" "}
                              <span className="font-semibold">
                                {formatCurrency(item.harga_produk)}
                              </span>
                            </p>
                          </div>
                          <p className="pt-1 text-sm font-extrabold text-[#0C2C55] sm:text-base">
                            Subtotal{" "}
                            {formatCurrency(item.harga_produk * item.quantity)}
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
                      <CreditCard size={20} />
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
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Clock3 size={14} />
                        Menunggu pembayaran
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Metode bayar</span>
                      <span className="font-semibold text-[#0C2C55]">
                        {paymentMethod === "qris"
                          ? "QRIS E-Wallet"
                          : `Transfer Bank ${paymentBank}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Total bayar</span>
                      <span className="text-lg font-extrabold text-[#0C2C55]">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 🟢 TOMBOL BARU UNTUK TRIGGER MIDTRANS */}
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={handleBayarMidtrans}
                      disabled={isPaying}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPaying ? "Memproses..." : "Lanjutkan Pembayaran"}
                      {!isPaying && <ArrowRight size={16} />}
                    </button>

                    <Link
                      href="/riwayat"
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#0C2C55] transition-colors hover:bg-slate-50"
                    >
                      Kembali ke Riwayat Pesanan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}