import { useState, useEffect } from "react";

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(isNaN(scrollRatio) ? 0 : scrollRatio * 100);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return { products, isLoading, scrollProgress, handleScroll, formatRupiah };
};