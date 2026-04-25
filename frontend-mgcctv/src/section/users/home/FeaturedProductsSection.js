"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function FeaturedProductsSection({ 
  data, 
  products, 
  isLoading, 
  scrollProgress, 
  handleScroll, 
  formatRupiah 
}) {
  const sectionDesc = data?.content_value || "Koleksi perangkat keamanan terbaik pilihan Toko MGCCTV untuk perlindungan maksimal properti Anda.";

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Memuat katalog unggulan...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
   <section className="relative px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-10 bg-slate-50 overflow-hidden font-sans">
      
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-400/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            Koleksi Terbatas
          </span>
          <h2 className="text-3xl md:text-5xl text-slate-900 font-extrabold tracking-tight mt-2">
            Produk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Unggulan</span>
          </h2>
          <p className="mt-3 md:mt-4 text-slate-500 max-w-2xl mx-auto text-sm md:text-lg px-2 leading-relaxed">
            {sectionDesc}
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm mx-4">
            <ShoppingBag className="mx-auto w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Katalog unggulan sedang diperbarui.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div 
              onScroll={handleScroll}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 md:gap-6 lg:gap-8 pb-8 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product) => (
                <motion.div 
                  variants={cardVariants}
                  key={product.id_produk} 
                  className="w-[60vw] max-w-[240px] md:w-auto md:max-w-none snap-center shrink-0 group flex flex-col bg-white rounded-2xl md:rounded-3xl p-3.5 md:p-4 shadow-sm ring-1 ring-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 hover:ring-blue-100 transition-all duration-500"
                >
                  
                  <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center p-2 md:p-4">
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col gap-1.5 md:gap-2">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                        {product.merek || "Best Seller"}
                      </span>
                      {product.stok <= 5 && product.stok > 0 && (
                        <span className="bg-red-500/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                          Sisa {product.stok}
                        </span>
                      )}
                    </div>

                    <img 
                      src={product.gambar_produk || "https://via.placeholder.com/400?text=No+Image"} 
                      alt={product.nama_produk} 
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>

                  <div className="mt-3 md:mt-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-1.5 md:mb-2 line-clamp-2">
                      {product.nama_produk}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3 md:mb-4 grow">
                      {product.deskripsi_produk}
                    </p>
                    
                    <div className="flex items-end justify-between mt-auto pt-3 md:pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-0.5 md:mb-1">Harga Khusus</p>
                        <p className="text-blue-600 font-extrabold text-lg md:text-xl">
                          {formatRupiah(product.harga_produk)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/produk/${product.id_produk}`} 
                    className="mt-4 md:mt-5 w-full flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3.5 bg-slate-50 text-slate-700 font-bold rounded-xl ring-1 ring-slate-200 hover:bg-blue-600 hover:text-white hover:ring-blue-600 transition-all duration-300 text-xs md:text-sm"
                  >
                    Lihat Detail
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 md:w-4 md:h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="md:hidden mt-4 flex justify-center items-center">
              <div className="w-12 h-1 bg-slate-200 rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full w-1/2 bg-blue-600 rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translateX(${scrollProgress}%)` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}