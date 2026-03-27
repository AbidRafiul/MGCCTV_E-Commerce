"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function TambahBarangPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);
  
  // State untuk form input
  const [form, setForm] = useState({
    nama_produk: "",
    deskripsi_produk: "",
    harga_produk: "",
    stok: "",
    ms_kategori_id_kategori: "",
  });

  // State khusus untuk file gambar
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);

  // Ambil daftar merek (kategori) dari database saat halaman dimuat
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/kategori", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (res.ok) setKategoriList(data);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    fetchKategori();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fungsi untuk menangani pemilihan gambar dan membuat preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambar(file);
      setPreview(URL.createObjectURL(file)); // Membuat URL sementara untuk preview di browser
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.ms_kategori_id_kategori) {
      Swal.fire("Peringatan", "Silakan pilih merek produk terlebih dahulu!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // Karena kita mengirim file fisik, kita WAJIB menggunakan FormData (bukan JSON stringify)
      const formData = new FormData();
      formData.append("nama_produk", form.nama_produk);
      formData.append("deskripsi_produk", form.deskripsi_produk);
      formData.append("harga_produk", form.harga_produk);
      formData.append("stok", form.stok);
      formData.append("ms_kategori_id_kategori", form.ms_kategori_id_kategori);
      
      // Kata "gambar" di bawah ini harus sama dengan upload.single("gambar") di rute backend
      if (gambar) {
        formData.append("gambar", gambar); 
      }

      const res = await fetch("http://localhost:3000/api/admin/produk", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
          // JANGAN tambahkan "Content-Type": "application/json" di sini jika pakai FormData!
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan produk");
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Produk berhasil ditambahkan ke database.",
        icon: "success",
        confirmButtonColor: "#0C2C55"
      }).then(() => {
        router.push("/admin/barang"); // Kembali ke halaman tabel
      });

    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/admin/barang" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tambah Produk Baru</h1>
          <p className="text-sm text-slate-500">Masukkan detail informasi produk CCTV.</p>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* AREA UPLOAD GAMBAR */}
            <div className="col-span-1 space-y-4">
              <label className="text-sm font-bold text-slate-700 block">Foto Produk</label>
              <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-500 transition-colors">
                
                {preview ? (
                  // Tampilan jika gambar sudah dipilih
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  // Tampilan awal sebelum memilih
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Klik untuk unggah foto</p>
                    <p className="text-xs text-slate-400 mt-1">Maksimal ukuran 2MB (JPG/PNG)</p>
                  </div>
                )}
                
                {/* Input file yang disembunyikan menutupi seluruh area kotak */}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* AREA INPUT TEKS */}
            <div className="col-span-1 md:col-span-2 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Nama Produk</label>
                <input 
                  type="text" 
                  name="nama_produk"
                  value={form.nama_produk}
                  onChange={handleChange}
                  placeholder="Contoh: Hikvision DS-2CE56D0T-IRPF" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Merek</label>
                  <select 
                    name="ms_kategori_id_kategori"
                    value={form.ms_kategori_id_kategori}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Pilih Merek --</option>
                    {kategoriList.map((kat) => (
                      <option key={kat.id_kategori} value={kat.id_kategori}>
                        {kat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Harga Jual (Rp)</label>
                  <input 
                    type="number" 
                    name="harga_produk"
                    value={form.harga_produk}
                    onChange={handleChange}
                    placeholder="Contoh: 1500000" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Stok Awal</label>
                  <input 
                    type="number" 
                    name="stok"
                    value={form.stok}
                    onChange={handleChange}
                    placeholder="Contoh: 50" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Deskripsi Produk</label>
                <textarea 
                  name="deskripsi_produk"
                  value={form.deskripsi_produk}
                  onChange={handleChange}
                  rows="4" 
                  placeholder="Tuliskan spesifikasi dan deskripsi lengkap..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                ></textarea>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/admin/barang" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0C2C55] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><Upload size={18} /> Simpan Produk</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}