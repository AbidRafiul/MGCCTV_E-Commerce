"use client";

import { ShoppingCart, Zap, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import CheckoutProfileDialog from "@/components/modals/CheckoutProfileDialog"; 

export default function DetailContentSection({ 
  product, 
  isProfileModalOpen, 
  setIsProfileModalOpen, 
  userProfileToComplete, 
  handleAddToCart, 
  handleBuyNow, 
  handleSaveProfile, 
  formatRupiah, 
  fadeUpVariant 
}) {

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center py-32 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 font-medium text-sm">Memuat detail produk...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 font-sans mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* KIRI: GAMBAR PRODUK */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUpVariant}
            className="lg:col-span-5 relative"
          >
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="relative aspect-square bg-white rounded-2xl flex items-center justify-center p-4 border border-slate-200 shadow-sm overflow-hidden group">
                <img
                  src={product.gambar_produk || "/placeholder-cctv.png"}
                  alt={product.nama_produk}
                  className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col items-center text-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <ShieldCheck size={18} className="text-blue-600 mb-1" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Garansi Resmi</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <CheckCircle2 size={18} className="text-emerald-500 mb-1" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">100% Original</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <Truck size={18} className="text-amber-500 mb-1" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Kirim Aman</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KANAN: INFORMASI & TOMBOL AKSI */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.1 }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="border-b border-slate-200 pb-4 mb-5">
              <span className="inline-block bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm mb-2">
                {product.merek || product.nama_kategori}
              </span>
              
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-2">
                {product.nama_produk}
              </h1>
              
              <p className="text-xl sm:text-2xl font-black text-blue-600">
                {formatRupiah(product.harga_produk)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <Zap size={16} className="fill-white/20" /> Beli Sekarang
              </button>
              <button
                onClick={handleAddToCart}
                className="sm:flex-none w-full sm:w-auto bg-white text-slate-700 border border-slate-300 py-2.5 px-4 md:px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <ShoppingCart size={16} /> Keranjang
              </button>
            </div>

            <div className="bg-slate-50/50 rounded-xl p-4 sm:p-5 space-y-5 border border-slate-200">
              
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Ringkasan
                </h3>
                <div className="space-y-1.5 text-[13px]">

                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Kategori</span>
                    <span className="text-slate-900 font-semibold">{product.nama_kategori || "CCTV"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Estimasi Pengiriman</span>
                    <span className="text-slate-900 font-semibold">2 - 3 Hari Kerja</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Deskripsi Lengkap
                </h3>
                <p className="text-slate-600 text-[12px] sm:text-[13px] leading-relaxed text-justify">
                  {product.deskripsi_produk || "Informasi detail mengenai spesifikasi produk belum tersedia dari pihak distributor."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Fitur Utama
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    `Resolusi Tinggi (Original ${product.merek || 'Produk'})`,
                    "Tahan Cuaca Extreme (IP67)",
                    "Advanced Night Vision (Infrared)",
                    "Garansi Resmi MGCCTV"
                  ].map((fitur, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[12px] sm:text-[13px] text-slate-600 font-medium">
                      <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{fitur}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      <CheckoutProfileDialog 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfileToComplete}
        onSave={handleSaveProfile}
      />
    </>
  );
}