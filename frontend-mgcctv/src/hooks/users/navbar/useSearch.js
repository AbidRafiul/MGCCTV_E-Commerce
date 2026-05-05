import { useState, useEffect } from "react";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:3000/api/public/produk?search=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          
          if (res.ok) {
            const hasilProduk = Array.isArray(data) ? data : (data.data || data.produk || []); 
            setSearchResults(hasilProduk.slice(0, 5));
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Gagal Live Search:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    isSearching, setIsSearching,
    showSuggestions, setShowSuggestions
  };
};