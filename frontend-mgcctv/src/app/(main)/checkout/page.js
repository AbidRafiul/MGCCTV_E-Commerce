"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Phone, Home, ChevronRight, ShieldCheck, Package, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { AUTH_API_URL } from "@/lib/api";
import { ensureCheckoutProfileComplete, openCheckoutProfileEditor } from "@/services/checkoutProfileService";
import { clearCheckoutItems, getCheckoutItems } from "@/services/cartService";

import PaymentMethodCard from "@/components/checkout/PaymentMethodCard";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;
  return { nama: user.nama || "", no_hp: user.no_hp || "", alamat: user.alamat || "" };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Default payment sekarang kita set ke 'bni'
  const [selectedPayment, setSelectedPayment] = useState("bni");

  useEffect(() => {
    const loadCheckoutData = async () => {
      setCheckoutItems(getCheckoutItems());
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const response = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setShippingProfile(normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null));
        }
      } catch (error) {
        console.error("Gagal mengambil profil pengiriman:", error);
      }
    };
    loadCheckoutData();
  }, []);

  const totalCheckout = checkoutItems.reduce((total, item) => total + item.harga_produk * item.quantity, 0);

  const handleEditShippingProfile = async () => {
    const updatedProfile = await openCheckoutProfileEditor();
    if (!updatedProfile) return;
    setShippingProfile(normalizeProfile(updatedProfile));
  };

  const handleFinishCheckout = async () => {
    if (checkoutItems.length === 0) {
      toast.error("Checkout Kosong", { description: "Belum ada produk yang dipilih untuk checkout." });
      return;
    }

    const canContinue = await ensureCheckoutProfileComplete();
    if (!canContinue) return;

    // START: PROSES PAYMENT GATEWAY (MIDTRANS)
    setIsProcessing(true);

    /* TODO: IMPLEMENTASI MIDTRANS NANTI DI SINI
      1. Buat payload pesanan (id_order, totalCheckout, selectedPayment, shippingProfile)
      2. Hit endpoint backend kamu (misal: POST /api/transaction)
      3. Terima token/URL Midtrans dari backend
      4. Arahkan user ke halaman pembayaran Midtrans (window.snap.pay(token) atau redirect URL)
    */

    // Simulasi loading API selama 2 detik (DUMMY)
    setTimeout(() => {
      setIsProcessing(false);
      
      toast.info("Sistem Sedang Dikembangkan", {
        description: `Integrasi Payment Gateway untuk metode ${selectedPayment.toUpperCase()} akan segera hadir!`,
        duration: 4000,
      });
      
      // Jika butuh membersihkan keranjang setelah dummy sukses:
      // clearCheckoutItems();
      // window.location.href = "/beranda"; 
    }, 2000);
  };

  // Konfigurasi Animasi Framer
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  return (
    <AuthGuard>
      <Navbar />
      <section className="min-h-screen bg-slate-50 px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32 font-sans overflow-hidden">
        <div className="mx-auto max-w-6xl relative">
          <div className="absolute -top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* HEADER CHECKOUT */}
          <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
            <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">Tahap Akhir</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Checkout <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Pesanan</span>
            </h1>
            <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto mt-2">
              <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0"><Home size={14} className="mb-[1px]" /> Beranda</Link>
              <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
              <Link href="/keranjang" className="hover:text-blue-600 transition-colors shrink-0">Keranjang</Link>
              <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
              <span className="text-slate-900 shrink-0">Checkout</span>
            </nav>
          </div>

          {checkoutItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[32px] border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm px-5 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-24 sm:w-24"><Package size={36} className="sm:w-10 sm:h-10" /></div>
              <h2 className="mt-6 text-xl font-extrabold text-slate-900 sm:text-2xl">Belum ada produk untuk di-checkout</h2>
              <Link href="/keranjang" className="mt-8 inline-flex items-center justify-center bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all hover:-translate-y-1">Kembali ke Keranjang</Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full lg:w-7/12 space-y-6">
                
                {/* 1. KARTU ALAMAT PENGIRIMAN */}
                <motion.div variants={itemVariants} className="rounded-[28px] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-blue-100 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><MapPin className="text-blue-600" size={22} /> Alamat Pengiriman</h2>
                    <button type="button" onClick={handleEditShippingProfile} className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100">Ubah Data</button>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 truncate">{shippingProfile?.nama || "Data Nama Kosong"}</h3>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600 border border-slate-100"><Phone size={14} className="text-slate-400" />{shippingProfile?.no_hp || "No HP Kosong"}</div>
                    <p className="text-sm leading-relaxed text-slate-500 mt-2">{shippingProfile?.alamat || "Alamat pengiriman belum diisi. Silakan lengkapi data Anda."}</p>
                  </div>
                </motion.div>

                {/* 2. KARTU METODE PEMBAYARAN */}
                <motion.div variants={itemVariants}>
                  <PaymentMethodCard selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} />
                </motion.div>

                {/* 3. KARTU DAFTAR PRODUK */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900 px-2 flex items-center gap-2"><Package className="text-blue-600" size={20} /> Produk yang Dipesan</h3>
                  {checkoutItems.map((item) => (
                    <div key={item.id_produk} className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:shadow-md transition-shadow">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2.5 sm:h-24 sm:w-24 border border-slate-100">
                        <img src={item.gambar_produk || "/images/placeholder.jpg"} alt={item.nama_produk} className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded">{item.merek || "MGCCTV"}</p>
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg line-clamp-2 leading-snug">{item.nama_produk}</h2>
                        <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:gap-4 mt-2">
                          <p>Jumlah: <span className="font-bold text-slate-700">{item.quantity}x</span></p>
                          <p className="hidden sm:block text-slate-300">•</p>
                          <p>Harga: <span className="font-semibold text-slate-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.harga_produk)}</span></p>
                        </div>
                      </div>
                      <div className="sm:text-right pt-3 border-t border-slate-100 sm:border-0 sm:pt-0">
                        <p className="text-xs text-slate-400 font-medium mb-1">Subtotal</p>
                        <p className="text-base font-black text-blue-600 sm:text-lg">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.harga_produk * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* KANAN: RINGKASAN PESANAN (Sticky) */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full lg:w-5/12 lg:sticky lg:top-28">
                <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4">Ringkasan Tagihan</h2>
                  
                  <div className="space-y-4 mb-6 text-sm sm:text-base">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Total Produk</span>
                      <span className="text-slate-900 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{checkoutItems.length} Barang</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-900 font-bold">Total Pembayaran</span>
                      <span className="text-2xl sm:text-3xl font-black text-blue-600">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalCheckout)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-4 flex items-start gap-3 mb-8 border border-blue-100 transition-colors">
                    <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-blue-800">
                      Sistem pembayaran otomatis yang aman. Pesanan Anda akan langsung diproses setelah pembayaran berhasil diverifikasi.
                    </p>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleFinishCheckout} 
                    disabled={isProcessing} 
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg hover:-translate-y-1 bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isProcessing ? (
                      <><Loader2 size={20} className="animate-spin" /> Memproses...</>
                    ) : (
                      <><CreditCard size={20} className="transition-transform group-hover:scale-110" /> Bayar Sekarang</>
                    )}
                  </button>
                </div>
              </motion.div>

            </div>
          )}
        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}