"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, ChevronDown, MapPin } from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/produkService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState(["Semua"]); 
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [maxVisible, setMaxVisible] = useState(6);
  const [isMounted, setIsMounted] = useState(false);

  const produkPerHalaman = 12; // Dibuat 12 agar pas dengan grid padat

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [produkData, kategoriData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      setAllProducts(produkData || []);
      if (kategoriData && kategoriData.length > 0) {
        const listNamaKategori = kategoriData.map(kat => kat.nama_kategori);
        setCategories(["Semua", ...listNamaKategori]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleResize() {
      if (window.innerWidth < 640) {
        setMaxVisible(2); 
      } else if (window.innerWidth < 1024) {
        setMaxVisible(4); 
      } else {
        setMaxVisible(6); 
      }
    }
    handleResize();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredProducts = allProducts.filter((p) => {
    if (activeCategory === "Semua") return true;
    return p.merek === activeCategory; 
  });

  const jumlahHalaman = Math.max(1, Math.ceil(filteredProducts.length / produkPerHalaman));
  const indexTerakhir = currentPage * produkPerHalaman;
  const indexPertama = indexTerakhir - produkPerHalaman;
  const produkTampil = filteredProducts.slice(indexPertama, indexTerakhir);

  const pindahHalaman = (nomor) => {
    if (nomor === "...") return;
    setCurrentPage(nomor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (jumlahHalaman <= 5) {
      for (let i = 1; i <= jumlahHalaman; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(jumlahHalaman - 1, currentPage + 1);
      if (currentPage <= 3) end = 4;
      if (currentPage >= jumlahHalaman - 2) start = jumlahHalaman - 3;
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < jumlahHalaman - 2) pages.push("...");
      pages.push(jumlahHalaman);
    }
    return pages;
  };

  const currentMaxVisible = isMounted ? maxVisible : 6;
  const visibleCategories = categories.slice(0, currentMaxVisible);
  const hiddenCategories = categories.slice(currentMaxVisible);

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  // Variants untuk Animasi Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm md:text-base text-center">Menyiapkan katalog MGCCTV...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-[500px] max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 font-sans">
      
      {/* FILTER KATEGORI (Pill Modern) */}
      <div className="mb-10 flex flex-wrap gap-2.5 sm:mb-12 sm:gap-3">
        {visibleCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-900"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-400 hover:text-blue-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Dropdown "Lainnya" */}
        {hiddenCategories.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-300 ${
                hiddenCategories.includes(activeCategory)
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-900"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-400 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate max-w-[80px] md:max-w-none">
                {hiddenCategories.includes(activeCategory) ? activeCategory : "Lainnya"}
              </span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col py-2"
                >
                  {hiddenCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={`text-left px-5 py-3 text-sm font-bold transition-colors ${
                        activeCategory === cat
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* GRID PRODUK */}
      <div className="mb-12">
        {produkTampil.length > 0 ? (
          <motion.div 
            key={activeCategory + currentPage}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5"
          >
            {produkTampil.map((product) => (
              <motion.div variants={cardVariants} key={product.id_produk}>
                <Link 
                  href={`/produk/${product.id_produk}`} 
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg ring-1 ring-slate-200 transition-all duration-300 h-full flex flex-col font-sans hover:-translate-y-1"
                >
                  {/* Gambar Persegi */}
                  <div className="relative aspect-square overflow-hidden bg-white border-b border-slate-100 flex items-center justify-center p-2">
                    <div className="absolute top-2 left-0 bg-[#0C2C55] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-r-md shadow-sm z-10 flex items-center gap-0.5">
                      {product.merek || "CCTV"}
                    </div>
                    <img 
                      src={product.gambar_produk || "/images/placeholder.jpg"} 
                      alt={product.nama_produk}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  
                  {/* Detail Informasi */}
                  <div className="p-2.5 flex flex-col flex-grow gap-1 bg-white">
                    <h3 className="text-[12px] sm:text-[13px] font-medium text-slate-800 line-clamp-2 leading-snug">
                      {product.nama_produk}
                    </h3>
                    
                    {/* Deskripsi Singkat */}
                    <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                      {product.deskripsi_produk || "Produk keamanan original MGCCTV."}
                    </p>
                    
                    <div className="flex-grow"></div>
                    
                    {/* Harga */}
                    <p className="text-sm sm:text-base font-extrabold text-[#ee4d2d] truncate mt-1">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.harga_produk)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="w-full rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center"
          >
            <PackageSearch size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Belum ada produk untuk kategori "{activeCategory}"</p>
          </motion.div>
        )}
      </div>

      {/* PAGINATION MODERN */}
      {jumlahHalaman > 1 && (
        <div className="mt-10 flex justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => pindahHalaman(currentPage - 1)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={20} className="stroke-[2.5px]" />
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {getPageNumbers().map((page, i) => (
                <button 
                  key={i}
                  onClick={() => pindahHalaman(page)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
                    page === "..." ? "cursor-default text-slate-400" : 
                    currentPage === page 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === jumlahHalaman || filteredProducts.length === 0}
              onClick={() => pindahHalaman(currentPage + 1)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={20} className="stroke-[2.5px]" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
}