"use client";

import { useState } from "react";
import { ShoppingCart, Zap, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ensureCheckoutProfileComplete, saveProfileCompletion } from "@/services/checkoutProfileService";
import { addCartItem, saveCheckoutItems } from "@/services/cartService";
import { motion } from "framer-motion";
import CheckoutProfileDialog from "@/components/modals/CheckoutProfileDialog"; // IMPORT MODAL SHADCN


export default function DetailContent({ product }) {
  const router = useRouter();
  const pathname = usePathname();

  // =========================================================
  // STATE UNTUK MODAL PROFIL SHADCN
  // =========================================================
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfileToComplete, setUserProfileToComplete] = useState(null);

  // =========================================================
  // GUARD CLAUSE (PENJAGA) - Mencegah Error "null"
  // =========================================================
  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center py-32 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Memuat detail produk...</p>
      </div>
    );
  }

  const redirectToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname || "/produk")}`);
  };

  const handleAddToCart = async () => {
    try {
      await addCartItem(product);
      router.push("/keranjang");
    } catch (error) {
      if (error?.status === 401) {
        redirectToLogin();
        return;
      }

      Swal.fire({
        title: "Keranjang Gagal Diperbarui",
        text: error?.message || "Terjadi kesalahan saat menambahkan produk.",
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    }
  };

  // =========================================================
  // FUNGSI LANJUT KE CHECKOUT (Dipanggil setelah profil lengkap)
  // =========================================================
  const proceedToCheckout = () => {
    saveCheckoutItems([
      {
        ...product,
        quantity: 1,
      },
    ]);
    router.push("/checkout");
  };

  // =========================================================
  // FUNGSI CEK PROFIL SAAT KLIK "BELI SEKARANG"
  // =========================================================
  const handleBuyNow = async () => {
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("token")
    ) {
      redirectToLogin();
      return;
    }

    // 1. Cek apakah profil sudah lengkap (tanpa memunculkan Swal)
    const { isComplete, profile } = await ensureCheckoutProfileComplete();

    // 2. Jika data belum lengkap, buka Modal Shadcn
    if (!isComplete) {
      if (profile) {
        setUserProfileToComplete(profile);
        setIsProfileModalOpen(true);
      } else {
        // Jika profile null, berarti token expired atau error server
        Swal.fire({
          title: "Sesi Berakhir", 
          text: "Silakan login kembali untuk melanjutkan.", 
          icon: "error",
          confirmButtonColor: "#0C2C55"
        });
        redirectToLogin();
      }
      return;
    }

    // 3. Jika profil sudah lengkap sejak awal, langsung checkout!
    proceedToCheckout();
  };

  // =========================================================
  // FUNGSI MENYIMPAN DATA DARI MODAL SHADCN
  // =========================================================
  const handleSaveProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await saveProfileCompletion({ token, ...updatedData });
      setIsProfileModalOpen(false); // Tutup modal jika sukses
      proceedToCheckout(); // Lanjut otomatis ke checkout
      return true; // Beri sinyal sukses ke komponen Modal
    } catch (error) {
      return false; // Error akan ditangkap dan ditampilkan oleh Modal
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  // Konfigurasi Animasi
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 font-sans">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mt-6">
          
          {/* ========================================================= */}
          {/* KIRI: GAMBAR PRODUK (Sticky di Desktop) */}
          {/* ========================================================= */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUpVariant}
            className="lg:col-span-5 relative"
          >
            {/* Sticky Container */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="relative aspect-square bg-slate-50 rounded-[32px] flex items-center justify-center p-8 border border-slate-100 shadow-sm overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] pointer-events-none"></div>
                <img
                  src={product.gambar_produk || "/placeholder-cctv.png"}
                  alt={product.nama_produk}
                  className="w-[90%] h-[90%] object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Jaminan Trust Badges di bawah gambar */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <ShieldCheck size={24} className="text-blue-600 mb-2" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700">Garansi Resmi</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700">100% Original</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <Truck size={24} className="text-amber-500 mb-2" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700">Kirim Aman</span>
                </div>
              </div>
            </div>
          </motion.div>


          {/* ========================================================= */}
          {/* KANAN: INFORMASI & TOMBOL AKSI */}
          {/* ========================================================= */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.2 }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Title & Price */}
            <div className="border-b border-slate-100 pb-8 mb-8">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm mb-4">
                {product.merek || product.nama_kategori}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-4">
                {product.nama_produk}
              </h1>
              <p className="text-3xl sm:text-4xl font-black text-blue-600">
                {formatRupiah(product.harga_produk)}
              </p>
            </div>

            {/* Tombol Aksi (Floating / Fix di Desktop) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 transition-all"
              >
                <Zap size={20} className="fill-white/20" /> Beli Sekarang
              </button>
              <button
                onClick={handleAddToCart}
                className="sm:flex-none w-full sm:w-auto bg-white text-slate-700 border-2 border-slate-200 py-4 px-6 md:px-10 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <ShoppingCart size={20} /> Keranjang
              </button>
            </div>

            {/* Spesifikasi Card */}
            <div className="bg-slate-50 rounded-[32px] p-6 sm:p-8 space-y-8 border border-slate-100">
              
              {/* Info Singkat */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Ringkasan
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 font-medium">Merk</span>
                    <span className="text-slate-900 font-bold">{product.merek || product.nama_kategori}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 font-medium">Kategori</span>
                    <span className="text-slate-900 font-bold">{product.nama_kategori || "CCTV"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 font-medium">Estimasi Pengiriman</span>
                    <span className="text-slate-900 font-bold">2 - 3 Hari Kerja</span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Deskripsi Lengkap
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">
                  {product.deskripsi_produk || "Informasi detail mengenai spesifikasi produk belum tersedia dari pihak distributor."}
                </p>
              </div>

              {/* Fitur Utama List */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Fitur Utama
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    `Resolusi Tinggi (Original ${product.merek || 'Produk'})`,
                    "Tahan Cuaca Extreme (IP67)",
                    "Advanced Night Vision (Infrared)",
                    "Garansi Resmi MGCCTV"
                  ].map((fitur, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{fitur}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* RENDER MODAL SHADCN DI SINI */}
      {/* ========================================================= */}
      <CheckoutProfileDialog 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfileToComplete}
        onSave={handleSaveProfile}
      />
    </>
  );
}