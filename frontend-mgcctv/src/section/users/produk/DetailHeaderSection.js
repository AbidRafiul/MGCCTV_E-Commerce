"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function DetailHeaderSection({ productName }) {
  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 sm:pt-12 font-sans">
      <div className="relative z-10 flex flex-col items-start">
        {/* Breadcrumb gaya kapsul modern (Pill style) */}
        <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-slate-100/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
            <Home size={14} className="mb-[1px]" />
            Beranda
          </Link>
          <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
          <Link href="/produk" className="hover:text-blue-600 transition-colors shrink-0">
            Katalog Produk
          </Link>
          <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
          <span className="text-slate-900 truncate max-w-[120px] sm:max-w-[300px] shrink-0">
            {productName || "Memuat..."}
          </span>
        </nav>
      </div>
    </div>
  );
}