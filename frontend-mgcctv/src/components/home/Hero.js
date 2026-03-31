"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero({ data }) {
  const bgImage = data?.url_gambar || "/images/header.jpg";
  const descText = data?.content_value || "Hadirkan keamanan mutakhir di genggaman Anda. Solusi CCTV cerdas dengan kualitas Ultra HD untuk melindungi rumah dan bisnis Anda 24/7.";

  // Konfigurasi animasi Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative w-full min-h-[80vh] md:min-h-[100svh] flex items-center overflow-hidden bg-slate-900 font-sans">
      
      {/* Background Image dengan Animasi Zoom-out perlahan */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={bgImage}
          alt="MG CCTV Header"
          className="w-full h-full object-cover scale-x-[-1] object-center opacity-70"
        />
      </motion.div>

      {/* Overlay Gradient (Gelap di kiri, transparan di kanan) agar teks selalu terbaca */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent"></div>
      {/* Tambahan overlay bawah untuk layar HP */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent md:hidden"></div>

      {/* Konten Utama */}
      <div className="relative z-10 w-full px-6 py-20 md:px-16 lg:px-24">
        <motion.div 
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge Modern */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-200 backdrop-blur-md shadow-lg">
              <ShieldCheck size={16} className="text-blue-400" />
              Sistem Keamanan Pintar
            </span>
          </motion.div>

          {/* Judul Utama */}
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
              Awasi Segalanya, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Dari Mana Saja.
              </span>
            </h1>
          </motion.div>

          {/* Deskripsi */}
          <motion.div variants={itemVariants}>
            <p className="mb-10 text-base md:text-xl text-slate-300 max-w-xl leading-relaxed">
              {descText}
            </p>
          </motion.div>

          {/* Tombol Aksi */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 md:gap-6">
            {/* Tombol Utama */}
            <Link
              href="/produk"
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-blue-600/50"
            >
              Belanja Sekarang
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Tombol Sekunder (Glassmorphism) */}
            <Link
              href="/tentang"
              className="flex items-center gap-2 rounded-xl border border-slate-400/30 bg-white/5 px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-slate-300/50"
            >
              Pelajari Lebih Lanjut
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}