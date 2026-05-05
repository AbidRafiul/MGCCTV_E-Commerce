"use client";

import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// Import disesuaikan dengan struktur folder kamu
import { useSearch } from "@/hooks/users/navbar/useSearch"; 

export default function SearchBar({ onNavigate, isMobile = false }) {
  const { 
    searchQuery, setSearchQuery, searchResults, 
    isSearching, showSuggestions, setShowSuggestions 
  } = useSearch();
  
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchQuery.trim() !== "" && onNavigate) {
      onNavigate(); 
    }
  };

  const handleSelectProduct = (id_produk) => {
    setSearchQuery(""); 
    setShowSuggestions(false);
    if (onNavigate) onNavigate();
    router.push(`/produk/${id_produk}`); 
  };

  return (
    <div className={`relative ${isMobile ? '' : 'text-slate-600'}`}>
      <form onSubmit={handleSearch}>
        <span className={`absolute inset-y-0 ${isMobile ? 'left-4' : 'left-3'} flex items-center text-slate-400 pointer-events-none`}>
          <Search size={isMobile ? 18 : 16} />
        </span>
        <input 
          type="text" 
          placeholder="Cari CCTV..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
          className={
            isMobile 
              ? "w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
              : "pl-9 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 border border-transparent rounded-full text-sm w-48 xl:w-64 focus:w-72 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none"
          }
        />
      </form>

      <AnimatePresence>
        {showSuggestions && searchQuery.trim().length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
          >
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin text-blue-500" /> Mencari...
              </div>
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((item, idx) => (
                  <li key={item.id_produk || idx}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(item.id_produk); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <Search size={14} className="text-slate-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate">{item.nama_produk}</span>
                        {item.merek && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.merek}</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                CCTV "{searchQuery}" tidak ditemukan
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}