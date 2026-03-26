    "use client";

    import { useState, useEffect } from "react";
    import Image from "next/image";
    import Link from "next/link";
    import { Search, Plus, Download, Edit3, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

    export default function DataBarangPage() {
    const [produk, setProduk] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data dari Backend
    const fetchProduk = async () => {
        try {
        const res = await fetch("http://localhost:3000/api/admin/produk", {
            headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = await res.json();
        if (res.ok) {
            setProduk(data);
        }
        } catch (error) {
        console.error("Gagal menarik data produk:", error);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProduk();
    }, []);

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
    };

    // Helper untuk menentukan badge status
    const getStatusBadge = (stok, status_produk) => {
        if (status_produk === 0) return <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">Nonaktif</span>;
        if (stok === 0) return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">Habis</span>;
        if (stok <= 5) return <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">Stok Tipis</span>;
        return <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">Aktif</span>;
    };

    return (
        <div className="space-y-6">
        
        {/* HEADER & FILTER */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex w-full md:w-auto gap-3">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                type="text" 
                placeholder="Cari nama barang" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
            </div>
            {/* Filter sementara belum fungsional */}
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>Semua Merek</option>
            </select>
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>Semua Status</option>
            </select>
            </div>

            <Link href="/admin/barang/tambah" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={18} />
            Tambah Barang
            </Link>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Table Header Area */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Daftar Produk CCTV</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Total {produk.length} produk terdaftar</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={16} />
                Export
            </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Merek</th>
                    <th className="px-6 py-4">Harga Jual</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                
                {isLoading ? (
                    <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-500">Memuat data produk...</td>
                    </tr>
                ) : produk.length === 0 ? (
                    <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-500">Belum ada produk yang ditambahkan.</td>
                    </tr>
                ) : (
                    produk.map((item) => (
                    <tr key={item.id_produk} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            
                            {/* Gambar Cloudinary */}
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {/* FILTER DIPERKETAT: Cek apakah gambar_produk ada DAN diawali dengan http atau / */}
                            {item.gambar_produk && (item.gambar_produk.startsWith('http') || item.gambar_produk.startsWith('/')) ? (
                                <Image 
                                src={item.gambar_produk} 
                                alt={item.nama_produk} 
                                fill
                                className="object-cover"
                                sizes="48px"
                                />
                            ) : (
                                // Jika formatnya aneh atau kosong, tampilkan ikon fallback ini
                                <ImageIcon className="text-slate-400" size={20} />
                            )}
                            </div>

                            <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{item.nama_produk}</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                SKU: PRD-{String(item.id_produk).padStart(4, '0')}
                            </span>
                            </div>
                        </div>
                        </td>
                        
                        {/* Karena Kategori di DB dipakai untuk Merek, kita hardcode Kategori di UI menjadi Alat Keamanan */}
                        <td className="px-6 py-4 font-medium text-slate-600">Keamanan</td>
                        
                        <td className="px-6 py-4 font-medium text-slate-600">{item.merek || "-"}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{formatRupiah(item.harga_produk)}</td>
                        <td className="px-6 py-4 font-bold">
                        <span className={item.stok > 5 ? "text-green-600" : "text-orange-500"}>{item.stok}</span>
                        </td>
                        <td className="px-6 py-4">
                        {getStatusBadge(item.stok, item.status_produk)}
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit3 size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                            <Trash2 size={16} />
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))
                )}

                </tbody>
            </table>
            </div>

        </div>
        </div>
    );
    }