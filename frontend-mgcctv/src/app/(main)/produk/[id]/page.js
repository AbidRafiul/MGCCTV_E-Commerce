"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useProductDetail } from "@/hooks/users/produk/useProductDetail";
import DetailHeaderSection from "@/section/users/produk/DetailHeaderSection";
import DetailContentSection from "@/section/users/produk/DetailContentSection";
import { getProductById } from "@/services/produkService"; 

export default function DetailProdukPage() {
  const params = useParams(); 
  const id_produk = params?.id; 

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDetailProduk = async () => {
      if (!id_produk) return;
      
      try {
        const data = await getProductById(id_produk);
        
        if (data) {
          setProduct(data); 
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Gagal mengambil detail produk:", err);
        setError(true);
      }
    };

    fetchDetailProduk();
  }, [id_produk]);

  const detailState = useProductDetail(product);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-700">Produk tidak ditemukan 🥲</h2>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <DetailHeaderSection productName={product?.nama_produk} />
      
      <DetailContentSection 
        product={product}
        {...detailState}
      />
    </main>
  );
}