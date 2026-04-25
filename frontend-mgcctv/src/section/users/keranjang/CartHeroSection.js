"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function CartHeroSection() {
  return (
    <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
      <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
        Pesanan Anda
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
        Detail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Keranjang</span>
      </h1>
      
      {/* Breadcrumb Modern */}
      <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
        <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
          <Home size={14} className="mb-[1px]" />
          Beranda
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
        <Link href="/produk" className="hover:text-blue-600 transition-colors shrink-0">
          Produk
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
        <span className="text-slate-900 truncate max-w-[120px] sm:max-w-[300px] shrink-0">
          Keranjang
        </span>
      </nav>
    </div>
  );
}