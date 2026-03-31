"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, ChevronDown, ArrowRight } from "lucide-react";
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

  const produkPerHalaman = 9; 

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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
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
            key={activeCategory + currentPage} // Trigger re-animate saat ganti kategori/page
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8"
          >
            {produkTampil.map((product) => (
              <motion.div variants={cardVariants} key={product.id_produk}>
                <Link 
                  href={`/produk/${product.id_produk}`} 
                  className="group flex flex-col h-full bg-white rounded-3xl p-3.5 md:p-4 shadow-sm ring-1 ring-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 hover:ring-blue-100 transition-all duration-500"
                >
                  {/* Gambar */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center p-4">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                        {product.merek || "Best Seller"}
                      </span>
                    </div>
                    <img 
                      src={product.gambar_produk || "/images/placeholder.jpg"} 
                      alt={product.nama_produk} 
                      className="w-[85%] h-[85%] object-contain transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  
                  {/* Info Produk */}
                  <div className="mt-4 md:mt-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-sm md:text-base text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {product.nama_produk}
                    </h3>
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-1">Harga</p>
                        <p className="text-blue-600 font-extrabold text-base md:text-lg">
                          {formatRupiah(product.harga_produk)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Hover Action */}
                  <div className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl ring-1 ring-slate-200 hover:bg-blue-600 hover:text-white hover:ring-blue-600 transition-all duration-300 text-xs md:text-sm">
                    Lihat Detail
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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