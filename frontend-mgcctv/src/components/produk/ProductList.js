"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Loader2, PackageSearch, ChevronDown } from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/produkService";
import Link from "next/link";

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState(["Semua"]); 
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // State untuk deteksi ukuran layar (Biar responsive)
  const [maxVisible, setMaxVisible] = useState(6);
  const [isMounted, setIsMounted] = useState(false);

  const produkPerHalaman = 9; 

  // Ambil data API
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

  // Event Listener untuk Responsive Dropdown & Click Outside
  useEffect(() => {
    setIsMounted(true); // Mencegah error hydration di Next.js

    // Fungsi deteksi klik di luar dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    // Fungsi deteksi ukuran layar (HP vs Laptop)
    function handleResize() {
      if (window.innerWidth < 640) {
        setMaxVisible(2); // Di HP cuma nampil 2 kategori + tombol Lainnya
      } else if (window.innerWidth < 1024) {
        setMaxVisible(4); // Di Tablet nampil 4 kategori
      } else {
        setMaxVisible(6); // Di Laptop nampil 6 kategori
      }
    }

    handleResize(); // Cek saat pertama kali web dibuka
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

  // LOGIKA PAGINATION
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

  // LOGIKA PEMISAH KATEGORI (Menggunakan maxVisible yang sudah responsive)
  const currentMaxVisible = isMounted ? maxVisible : 6;
  const visibleCategories = categories.slice(0, currentMaxVisible);
  const hiddenCategories = categories.slice(currentMaxVisible);

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm md:text-base text-center">Sinkronisasi gudang MG CCTV...</p>
      </div>
    );
  }

  return (
    <section className="px-4 md:px-6 pb-20 max-w-6xl mx-auto min-h-[500px]">
      
      {/* FILTER KATEGORI */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8 md:mb-12 relative">
        
        {/* Tombol Kategori Utama */}
        {visibleCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelectCategory(cat)}
            className={`px-4 py-2 md:px-8 md:py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
              activeCategory === cat
                ? "bg-[#0C2C55] text-white border-[#0C2C55] shadow-lg shadow-blue-900/20"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
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
              className={`flex items-center gap-1 md:gap-2 px-4 py-2 md:px-8 md:py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
                hiddenCategories.includes(activeCategory)
                  ? "bg-[#0C2C55] text-white border-[#0C2C55] shadow-lg shadow-blue-900/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              <span className="truncate max-w-[80px] md:max-w-none">
                {hiddenCategories.includes(activeCategory) ? activeCategory : "Lainnya"}
              </span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Menu Isi Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 md:left-0 mt-2 md:mt-3 w-40 md:w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col py-2 animate-in fade-in slide-in-from-top-2">
                {hiddenCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`text-left px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-bold transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-50 text-[#0C2C55]"
                        : "text-gray-500 hover:bg-slate-50 hover:text-[#0C2C55]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* GRID PRODUK */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 mb-12 md:mb-16">
        {produkTampil.length > 0 ? (
          produkTampil.map((product) => (
            <Link 
              href={`/produk/${product.id_produk}`} 
              key={product.id_produk} 
              // Padding dikecilkan (p-3 untuk HP, p-6 untuk laptop), radius dikecilkan
              className="group bg-white rounded-[16px] md:rounded-[32px] p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 flex flex-col"
            >
              {/* Kotak gambar diperkecil margin dan padding-nya */}
              <div className="aspect-square bg-slate-50 rounded-[12px] md:rounded-[24px] mb-3 md:mb-6 flex items-center justify-center p-2 md:p-6 overflow-hidden relative">
                <img 
                  src={product.gambar_produk || "/images/placeholder.jpg"} 
                  alt={product.nama_produk} 
                  className="w-[90%] h-[90%] md:w-[80%] md:h-[80%] object-contain group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              
              <div className="space-y-1 flex-grow flex flex-col justify-between">
                <div>
                  {/* Teks Judul dikecilkan ke text-xs di HP */}
                  <h3 className="font-bold text-xs md:text-lg text-[#0C2C55] line-clamp-2 leading-snug md:leading-normal">
                    {product.nama_produk}
                  </h3>
                  {/* Teks Harga dikecilkan ke text-sm di HP */}
                  <p className="text-blue-600 font-black text-sm md:text-2xl mt-1 md:mt-2">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.harga_produk)}
                  </p>
                </div>
                {/* Badge Rating dikecilkan */}
                <div className="flex items-center gap-1 bg-yellow-50 w-fit px-2 py-0.5 md:px-2.5 md:py-1 rounded-full mt-1.5 md:mt-2">
                  <span className="text-[#0C2C55] font-bold text-[9px] md:text-xs">4.8</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-16 md:py-20 bg-white rounded-[24px] md:rounded-[40px] border border-dashed border-gray-200 mx-2 md:mx-0">
            <PackageSearch size={40} className="mx-auto text-gray-300 mb-3 md:mb-4 md:w-12 md:h-12" />
            <p className="text-gray-400 text-sm md:text-base px-4">Belum ada produk untuk kategori <span className="font-bold">"{activeCategory}"</span></p>
          </div>
        )}
      </div>

      {/* PAGINATION BOX */}
      {/* PAGINATION BOX (100% RESPONSIVE) */}
      <div className="flex justify-center mt-8 md:mt-10 px-4 w-full">
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg md:rounded-xl shadow-sm max-w-full">
          
          {/* Tombol Kiri (Fixed) */}
          <button 
            disabled={currentPage === 1}
            onClick={() => pindahHalaman(currentPage - 1)}
            className="p-2 md:p-3 text-[#0C2C55] hover:bg-gray-50 border-r border-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all shrink-0 rounded-l-lg md:rounded-l-xl"
          >
            <ChevronLeft size={18} className="stroke-[3px] md:w-5 md:h-5" />
          </button>
          
          {/* Angka Halaman (Bisa di-scroll di HP tanpa scrollbar) */}
          <div className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {getPageNumbers().map((page, i) => (
              <button 
                key={i}
                onClick={() => pindahHalaman(page)}
                className={`px-3 py-2 md:px-5 md:py-3 text-[11px] md:text-sm font-bold transition-all border-r border-gray-100 last:border-r-0 shrink-0 snap-center ${
                  page === "..." ? "cursor-default text-gray-400" : 
                  currentPage === page 
                  ? "bg-[#0C2C55] text-white" 
                  : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Tombol Kanan (Fixed) */}
          <button 
            disabled={currentPage === jumlahHalaman || filteredProducts.length === 0}
            onClick={() => pindahHalaman(currentPage + 1)}
            className="p-2 md:p-3 text-[#0C2C55] hover:bg-gray-50 border-l border-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all shrink-0 rounded-r-lg md:rounded-r-xl"
          >
            <ChevronRight size={18} className="stroke-[3px] md:w-5 md:h-5" />
          </button>

        </div>
      </div>

    </section>
  );
}