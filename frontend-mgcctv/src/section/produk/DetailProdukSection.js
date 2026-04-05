"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, PackageX } from "lucide-react"; // Tambahkan PackageX untuk icon kosong
import DetailHeader from "@/components/produk/DetailHeader";
import DetailContent from "@/components/produk/DetailContent";

export default function DetailProdukSection() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // State baru untuk menangkap error

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/public/produk/${id}`);
        
        // 1. CEK STATUS DULU SEBELUM PARSING JSON
        if (!res.ok) {
          throw new Error(`Produk tidak ditemukan (Status: ${res.status})`);
        }

        const data = await res.json();
        
        // 2. CEK STRUKTUR DATA (Bisa jadi dibungkus di dalam data.data)
        // Kadang backend mengirim { success: true, data: { id: 5, nama: "..." } }
        setProduct(data.data || data); 
        
      } catch (err) {
        console.error("Gagal ambil data:", err);
        setError(true); // Aktifkan mode error
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetail();
  }, [id]);

  // UI Saat Loading
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Loader2 className="animate-spin text-[#0C2C55]" size={40} />
    </div>
  );

  // UI Saat Produk Gagal Diambil / Tidak Ada (Mencegah Layar Blank/Crash)
  if (error || !product) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 gap-4 pt-20">
      <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-2">
        <PackageX size={48} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800">Produk Tidak Ditemukan</h2>
      <p className="text-slate-500 text-center max-w-sm">
        Maaf, produk yang Anda cari mungkin sudah dihapus atau URL yang Anda masukkan salah.
      </p>
    </div>
  );

  // UI Saat Sukses
  return (
    <div className="pt-28 bg-slate-50 min-h-screen pb-20">
      <DetailHeader productName={product?.nama_produk} />
      <DetailContent product={product} />
    </div>
  );
}