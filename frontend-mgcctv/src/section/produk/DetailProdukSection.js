"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import DetailHeader from "@/components/produk/DetailHeader";
import DetailContent from "@/components/produk/DetailContent";

export default function DetailProdukSection() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/public/produk/${id}`);
        const data = await res.json();
        if (res.ok) setProduct(data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-[#0C2C55]" size={40} />
    </div>
  );

  return (
    <div className="pt-28 bg-slate-50 min-h-screen pb-20">
      <DetailHeader productName={product?.nama_produk} />
      <DetailContent product={product} />
    </div>
  );
}