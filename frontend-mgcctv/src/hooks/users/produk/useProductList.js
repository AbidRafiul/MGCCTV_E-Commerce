import { useState, useEffect, useRef } from "react";
import { getAllProducts, getAllCategories } from "@/services/produkService";

export const useProductList = () => {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState(["Semua"]); 
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [maxVisible, setMaxVisible] = useState(6);
  const [isMounted, setIsMounted] = useState(false);

  const produkPerHalaman = 12; 

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

  return {
    activeCategory, setActiveCategory,
    loading, currentPage, setCurrentPage,
    isDropdownOpen, setIsDropdownOpen,
    dropdownRef,
    filteredProducts, jumlahHalaman, produkTampil,
    pindahHalaman, getPageNumbers,
    visibleCategories, hiddenCategories, handleSelectCategory
  };
};