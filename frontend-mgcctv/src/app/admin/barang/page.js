    "use client";

    import { useState, useEffect } from "react";
    import Image from "next/image";
    import Link from "next/link";
    import { Search, Plus, Download, Edit3, Trash2, Power, Image as ImageIcon } from "lucide-react";
    import Swal from "sweetalert2";
    import { exportToExcel } from "@/utils/exportExcel";

    export default function DataBarangPage() {
    // STATE UNTUK DATA
    const [allProduk, setAllProduk] = useState([]); // Menyimpan data asli utuh
    const [produk, setProduk] = useState([]);       // Menyimpan data yang sudah difilter untuk ditampilkan
    const [kategoriList, setKategoriList] = useState([]); // Menyimpan daftar Merek
    const [isLoading, setIsLoading] = useState(true);

    // STATE UNTUK FILTERING
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMerek, setSelectedMerek] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // 1. Fetch Data Produk
    const fetchProduk = async () => {
        try {
        const res = await fetch("http://localhost:3000/api/public/produk", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (res.ok) {
            setAllProduk(data);
            setProduk(data); // Awalnya, data yang difilter = semua data
        }
        } catch (error) {
        console.error("Gagal menarik data produk:", error);
        } finally {
        setIsLoading(false);
        }
    };

    // 2. Fetch Data Kategori (Merek) untuk Dropdown
    const fetchKategori = async () => {
        try {
        const res = await fetch("http://localhost:3000/api/public/kategori", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (res.ok) setKategoriList(data);
        } catch (error) {
        console.error("Gagal menarik kategori:", error);
        }
    };

    // Jalankan saat pertama kali halaman dimuat
    useEffect(() => {
        fetchProduk();
        fetchKategori();
    }, []);

    // 3. LOGIKA FILTERING (Berjalan otomatis setiap kali input filter atau data berubah)
    useEffect(() => {
        let result = allProduk;

        // Filter berdasarkan Nama Barang (Pencarian)
        if (searchQuery) {
        result = result.filter(item => 
            item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
        );
        }

        // Filter berdasarkan Merek
        if (selectedMerek) {
        // Kita cocokkan ID kategori karena select option mengirimkan value berupa ID
        result = result.filter(item => item.ms_kategori_id_kategori.toString() === selectedMerek);
        }

        // Filter berdasarkan Status & Stok
        if (selectedStatus) {
        switch(selectedStatus) {
            case "aktif":
            result = result.filter(item => item.status_produk === 1);
            break;
            case "nonaktif":
            result = result.filter(item => item.status_produk === 0);
            break;
            case "tipis":
            result = result.filter(item => item.stok > 0 && item.stok <= 5);
            break;
            case "habis":
            result = result.filter(item => item.stok === 0);
            break;
            default:
            break;
        }
        }

        setProduk(result);
    }, [searchQuery, selectedMerek, selectedStatus, allProduk]);


    // FUNGSI AKSI: Hapus
    const handleDelete = async (id_produk) => {
        Swal.fire({
        title: 'Apakah kamu yakin?',
        text: "Data dan foto produk ini akan dihapus permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#0C2C55',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            const res = await fetch(`http://localhost:3000/api/admin/produk/${id_produk}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) {
                Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
                fetchProduk();
            } else {
                const data = await res.json();
                Swal.fire('Error!', data.message, 'error');
            }
            } catch (error) {
            Swal.fire('Error!', 'Gagal menghubungi server.', 'error');
            }
        }
        });
    };

    // FUNGSI AKSI: Ganti Status
    const handleToggleStatus = async (id_produk, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const statusText = newStatus === 1 ? "Aktifkan" : "Nonaktifkan";

        Swal.fire({
        title: `${statusText} Produk?`,
        text: `Produk ini akan diubah menjadi ${newStatus === 1 ? 'Aktif' : 'Nonaktif'}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0C2C55',
        cancelButtonColor: '#slate-500',
        confirmButtonText: `Ya, ${statusText}`,
        cancelButtonText: 'Batal'
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            const res = await fetch(`http://localhost:3000/api/admin/produk/${id_produk}/status`, {
                method: "PATCH",
                headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ status_produk: newStatus })
            });
            
            if (res.ok) {
                Swal.fire('Berhasil!', `Status produk telah diperbarui.`, 'success');
                fetchProduk(); 
            } else {
                const data = await res.json();
                Swal.fire('Error!', data.message, 'error');
            }
            } catch (error) {
            Swal.fire('Error!', 'Gagal menghubungi server.', 'error');
            }
        }
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
    };

    const getStatusBadge = (stok, status_produk) => {
        if (status_produk === 0) return <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap">Nonaktif</span>;
        if (stok === 0) return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap">Habis</span>;
        if (stok <= 5) return <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap">Stok Tipis</span>;
        return <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap">Aktif</span>;
    };

    // --- FUNGSI EXPORT EXCEL (DATA BARANG) ---
const handleExportExcel = () => {
    if (produk.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada produk yang bisa diekspor.', 'warning'); return;
    }

    const dataToExport = produk.map((item, index) => ({
      "No": index + 1,
      "SKU": `PRD-${String(item.id_produk).padStart(4, '0')}`,
      "Nama Produk": item.nama_produk,
      "Merek": item.merek || "-",
      "Harga Jual": item.harga_produk,
      "Sisa Stok": item.stok,
      "Status": item.status_produk === 1 ? "Aktif" : "Nonaktif"
    }));

    const columnWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 45 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 15 }
    ];

    // Panggil pabrik Excel kita!
    exportToExcel(dataToExport, "Laporan_Data_Barang_MGCCTV", "Data Barang", columnWidths);
  };

    return (
        <div className="space-y-4 md:space-y-6">
        
        {/* HEADER & FILTER */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div className="flex flex-col md:flex-row w-full xl:w-auto gap-3">
            
            {/* INPUT PENCARIAN */}
            <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                type="text" 
                placeholder="Cari nama barang..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            <div className="flex w-full md:w-auto gap-3">
                {/* DROPDOWN FILTER MEREK */}
                <select 
                value={selectedMerek}
                onChange={(e) => setSelectedMerek(e.target.value)}
                className="w-full md:w-auto px-4 py-2.5 md:py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                <option value="">Semua Merek</option>
                {kategoriList.map(kat => (
                    <option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>
                ))}
                </select>

                {/* DROPDOWN FILTER STATUS */}
                <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full md:w-auto px-4 py-2.5 md:py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="tipis">Stok Tipis</option>
                <option value="habis">Stok Habis</option>
                </select>
            </div>

            </div>
            <Link href="/admin/barang/tambah" className="w-full xl:w-auto flex items-center justify-center bg-primary hover:bg-primary-hover text-white px-5 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0">
            <Plus size={18} /> Tambah Barang
            </Link>
        </div>

        {/* TAMPILAN DATA BARANG UTAMA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800">Daftar Produk CCTV</h2>
                <p className="text-[11px] md:text-xs font-medium text-slate-500 mt-0.5">
                Menampilkan {produk.length} dari {allProduk.length} produk
                </p>
            </div>
            <button 
            onClick={handleExportExcel} 
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs md:text-sm font-medium hover:bg-slate-50 transition-colors shrink-0 shadow-sm">
            <Download size={16} /> <span className="hidden sm:inline">Export Excel</span>
            </button>
            </div>

            {/* 1. TAMPILAN MOBILE (Card/Kartu Tumpuk) */}
            <div className="block md:hidden p-4 custom-scrollbar">
            {isLoading ? (
                <div className="py-10 text-center text-slate-500 text-sm">Memuat data produk...</div>
            ) : produk.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm">Produk tidak ditemukan.</div>
            ) : (
                <div className="space-y-4">
                {produk.map((item) => (
                    <div key={item.id_produk} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 relative transition-all duration-150 hover:border-blue-100 hover:shadow-blue-900/5">
                    <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {item.gambar_produk && (item.gambar_produk.startsWith('http') || item.gambar_produk.startsWith('/')) ? (
                            <Image src={item.gambar_produk} alt={item.nama_produk} fill className="object-cover" sizes="64px" />
                        ) : (
                            <ImageIcon className="text-slate-400" size={20} />
                        )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0 pr-16">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate-multiline-2">{item.nama_produk}</h3>
                            <span className="shrink-0 absolute top-4 right-4">{getStatusBadge(item.stok, item.status_produk)}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400">SKU: PRD-{String(item.id_produk).padStart(4, '0')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Merek</span>
                        <span className="font-semibold text-slate-600 text-xs">{item.merek || "Tidak Ada"}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Stok</span>
                        <span className="font-bold text-xs"><span className={item.stok > 5 ? "text-green-600" : "text-orange-500"}>{item.stok} Pcs</span></span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
                        <span className="font-bold text-slate-800 text-base">{formatRupiah(item.harga_produk)}</span>
                        <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleStatus(item.id_produk, item.status_produk)} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm" title={item.status_produk === 1 ? "Nonaktifkan" : "Aktifkan"}>
                            <Power size={16} />
                        </button>
                        <Link href={`/admin/barang/edit/${item.id_produk}`} className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm" title="Edit">
                            <Edit3 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(item.id_produk)} className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm" title="Hapus">
                            <Trash2 size={16} />
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* 2. TAMPILAN DESKTOP (Tabel Horizontal) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar p-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
                <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4">Produk</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Merek</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Harga Jual</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Stok</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 text-sm">Memuat data produk...</td></tr>
                ) : produk.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 text-sm">Produk tidak ditemukan.</td></tr>
                ) : (
                    produk.map((item) => (
                    <tr key={item.id_produk} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {item.gambar_produk && (item.gambar_produk.startsWith('http') || item.gambar_produk.startsWith('/')) ? (
                                <Image src={item.gambar_produk} alt={item.nama_produk} fill className="object-cover" sizes="(max-width: 768px) 40px, 48px" />
                            ) : (
                                <ImageIcon className="text-slate-400" size={18} />
                            )}
                            </div>
                            <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs md:text-sm">{item.nama_produk}</span>
                            <span className="text-[10px] md:text-[11px] font-medium text-slate-400 mt-0.5">SKU: PRD-{String(item.id_produk).padStart(4, '0')}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-slate-600 text-xs md:text-sm">{item.merek || "Tidak Ada"}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-800 text-xs md:text-sm">{formatRupiah(item.harga_produk)}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-xs md:text-sm"><span className={item.stok > 5 ? "text-green-600" : "text-orange-500"}>{item.stok}</span></td>
                        <td className="px-4 md:px-6 py-3 md:py-4">{getStatusBadge(item.stok, item.status_produk)}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleToggleStatus(item.id_produk, item.status_produk)} className="p-1.5 md:p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm" title={item.status_produk === 1 ? "Nonaktifkan" : "Aktifkan"}>
                            <Power size={14} className="md:w-4 md:h-4" />
                            </button>
                            <Link href={`/admin/barang/edit/${item.id_produk}`} className="p-1.5 md:p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm" title="Edit">
                            <Edit3 size={14} className="md:w-4 md:h-4" />
                            </Link>
                            <button onClick={() => handleDelete(item.id_produk)} className="p-1.5 md:p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm" title="Hapus">
                            <Trash2 size={14} className="md:w-4 md:h-4" />
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