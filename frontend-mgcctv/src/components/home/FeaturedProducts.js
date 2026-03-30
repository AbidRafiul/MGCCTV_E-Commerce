"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function FeaturedProducts({ data }) {
  const sectionDesc = data?.content_value || "Koleksi perangkat keamanan terbaik pilihan Toko MG CCTV untuk perlindungan maksimal properti Anda.";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mengambil data dari API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/cms/unggulan");
        if (res.ok) {
          const result = await res.json();
          setProducts(result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fungsi untuk menggerakkan indikator saat di-swipe
  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(isNaN(scrollRatio) ? 0 : scrollRatio * 100);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Memuat produk unggulan...</div>;
  }

  return (
    <section className="px-4 md:px-6 py-12 md:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADING SECTION */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl text-[#0C2C55] font-extrabold tracking-tight">
            Produk <span className="text-blue-600">Unggulan</span>
          </h2>
          <div className="w-16 md:w-20 h-1.5 bg-blue-600 mx-auto mt-3 md:mt-4 rounded-full"></div>
          <p className="text-gray-500 mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base px-2">
            {sectionDesc}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mx-4">
            <p className="text-gray-500 font-medium text-sm">Belum ada produk unggulan yang ditampilkan saat ini.</p>
          </div>
        ) : (
          
          <div>
            {/* CONTAINER KARTU (Scrollbar disembunyikan sepenuhnya) */}
            <div 
              onScroll={handleScroll}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 lg:gap-10 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product) => (
                <div 
                  key={product.id_produk} 
                  className="w-[70vw] max-w-[260px] md:w-auto md:max-w-none snap-center shrink-0 group bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 relative flex flex-col"
                >
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col gap-1.5 md:gap-2">
                    <span className="bg-[#0C2C55] text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest shadow-md w-fit">
                      {product.merek || "Best Seller"}
                    </span>
                    {product.stok <= 5 && product.stok > 0 && (
                      <span className="bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest shadow-md w-fit">
                        Sisa {product.stok}
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center p-0">
                    <img 
                      src={product.gambar_produk || "https://via.placeholder.com/400?text=No+Image"} 
                      alt={product.nama_produk} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>

                  <div className="mt-4 md:mt-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base md:text-lg text-[#0C2C55] leading-snug group-hover:text-blue-600 transition-colors mb-1.5 md:mb-2 line-clamp-2">
                        {product.nama_produk}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 md:mb-4">
                        {product.deskripsi_produk}
                      </p>
                    </div>
                    <p className="text-blue-600 font-extrabold text-lg md:text-xl mb-3 md:mb-4">
                      {formatRupiah(product.harga_produk)}
                    </p>
                  </div>

                  <Link 
                    href={`/produk/${product.id_produk}`} 
                    className="w-full py-2.5 md:py-3.5 flex justify-center bg-gray-50 text-[#0C2C55] font-bold rounded-xl border border-gray-100 hover:bg-[#0C2C55] hover:text-white hover:border-[#0C2C55] transition-all duration-300 text-xs md:text-sm"
                  >
                    Lihat Detail
                  </Link>
                </div>
              ))}
            </div>

            {/* INDIKATOR SCROLL AESTHETIC (Hanya muncul di Mobile) */}
            <div className="md:hidden mt-6 flex justify-center items-center">
              <div className="w-16 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full w-1/2 bg-blue-600 rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translateX(${scrollProgress}%)` }}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}