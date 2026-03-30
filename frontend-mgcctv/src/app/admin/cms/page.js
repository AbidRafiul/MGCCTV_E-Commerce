"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Trash2, Plus, Loader2, Info, Map, Store, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function CMSAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk Konten Teks & Gambar Utama Tentang Kami
const [konten, setKonten] = useState({
  1: { section_name: "Tentang Utama", content_value: "", url_gambar: "", preview: null, file: null },
  2: { section_name: "Info Toko", content_value: "", url_gambar: "" },
  3: { section_name: "Lokasi Toko", content_value: "", url_gambar: "" },
  4: { section_name: "Admin 1", content_value: "", url_gambar: "" },
  5: { section_name: "Admin 2", content_value: "", url_gambar: "" } 
});

  // State untuk Galeri
  const [galeri, setGaleri] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // 1. FETCH DATA AWAL
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Ambil Konten Teks Tentang Kami
      const resKonten = await fetch("http://localhost:3000/api/admin/cms/tentang", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resKonten.ok) {
        const dataKonten = await resKonten.json();
        const newKonten = { ...konten };
        dataKonten.forEach(item => {
          if (newKonten[item.id_cms_konten]) {
            newKonten[item.id_cms_konten].content_value = item.content_value || "";
            newKonten[item.id_cms_konten].url_gambar = item.url_gambar || "";
            newKonten[item.id_cms_konten].preview = item.url_gambar || null;
          }
        });
        setKonten(newKonten);
      }

      // Ambil Galeri
      const resGaleri = await fetch("http://localhost:3000/api/admin/cms/galeri", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resGaleri.ok) {
        setGaleri(await resGaleri.json());
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. HANDLER PERUBAHAN INPUT
  const handleKontenChange = (id, field, value) => {
    setKonten(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setKonten(prev => ({
        ...prev,
        [id]: { ...prev[id], file: file, preview: URL.createObjectURL(file) }
      }));
    }
  };

  // 3. SIMPAN KONTEN TENTANG KAMI
  const saveKonten = async (id) => {
    setIsSaving(id);
    try {
      const formData = new FormData();
      formData.append("section_name", konten[id].section_name);
      formData.append("content_value", konten[id].content_value);
      
      if (konten[id].file) {
        formData.append("gambar", konten[id].file);
      } else if (id === 3) {
        // Khusus Lokasi, url_gambar dipakai simpan link Map
        formData.append("url_gambar", konten[id].url_gambar);
      }

      const res = await fetch(`http://localhost:3000/api/admin/cms/tentang/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      Swal.fire({ title: "Berhasil!", text: "Konten berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
      fetchData(); 
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. UPLOAD FOTO GALERI
  const uploadGallery = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("gambar", file);
      formData.append("section_name", "Galeri");

      const res = await fetch("http://localhost:3000/api/admin/cms/galeri", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });

      if (!res.ok) throw new Error("Gagal mengunggah foto galeri");
      
      Swal.fire({ title: "Berhasil!", text: "Foto ditambahkan ke galeri.", icon: "success", timer: 1500, showConfirmButton: false });
      fetchData(); 
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsUploadingGallery(false);
      e.target.value = null; 
    }
  };

  // 5. HAPUS FOTO GALERI
  const deleteGallery = async (id) => {
    Swal.fire({
      title: "Hapus Foto?",
      text: "Foto ini akan dihapus dari galeri secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/admin/cms/galeri/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (!res.ok) throw new Error("Gagal menghapus foto");
          
          Swal.fire({ title: "Terhapus!", text: "Foto galeri telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
          fetchData();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Konten (CMS)</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola informasi toko, galeri, dan lokasi yang tampil di halaman Tentang Kami.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* ================================================= */}
        {/* KARTU 1: TENTANG UTAMA (ID 1) */}
        {/* ================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Store className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-700">Banner & Sejarah Toko</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <label className="text-sm font-bold text-slate-700 block mb-3">Foto Toko / Banner</label>
              <div 
                onClick={() => document.getElementById("upload-tentang").click()}
                className="relative aspect-video w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-500 transition-colors"
              >
                {konten[1].preview ? (
                  <img src={konten[1].preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="text-slate-400 mx-auto mb-2" size={30} />
                    <span className="text-xs text-slate-500 font-medium">Klik untuk upload foto</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg">Ubah Foto</span>
                </div>
              </div>
              <input type="file" id="upload-tentang" accept="image/*" className="hidden" onChange={(e) => handleImageChange(1, e)} />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <label className="text-sm font-bold text-slate-700 block mb-3">Deskripsi / Sejarah Singkat</label>
              <textarea 
                rows="6" 
                value={konten[1].content_value}
                onChange={(e) => handleKontenChange(1, "content_value", e.target.value)}
                placeholder="Tuliskan sejarah toko atau penjelasan layanan Anda..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none grow"
              ></textarea>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => saveKonten(1)}
                  disabled={isSaving === 1}
                  className="flex items-center gap-2 bg-[#0C2C55] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
                >
                  {isSaving === 1 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Bagian Ini
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* KARTU 2: INFO TOKO & JAM BUKA (ID 2) */}
        {/* ================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Info className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-700">Jam Operasional & Info</h2>
          </div>
          <div className="p-6">
            <label className="text-sm font-bold text-slate-700 block mb-3">Teks Informasi</label>
            <textarea 
              rows="4" 
              value={konten[2].content_value}
              onChange={(e) => handleKontenChange(2, "content_value", e.target.value)}
              placeholder="Senin - Sabtu: 08.00 - 18.00 WIB&#10;(Minggu Libur)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => saveKonten(2)}
                disabled={isSaving === 2}
                className="flex items-center gap-2 bg-[#0C2C55] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
              >
                {isSaving === 2 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Info
              </button>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* KARTU 3: LOKASI PETA (ID 3) */}
        {/* ================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Map className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-700">Lokasi & Peta</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Alamat Lengkap</label>
              <input 
                type="text" 
                value={konten[3].content_value}
                onChange={(e) => handleKontenChange(3, "content_value", e.target.value)}
                placeholder="Jl. Nusantara No.15..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">URL Embed Google Maps</label>
              <input 
                type="text" 
                value={konten[3].url_gambar} 
                onChange={(e) => handleKontenChange(3, "url_gambar", e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => saveKonten(3)}
                disabled={isSaving === 3}
                className="flex items-center gap-2 bg-[#0C2C55] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
              >
                {isSaving === 3 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Lokasi
              </button>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* KARTU 4: GALERI INSTALASI */}
        {/* ================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-blue-600" size={20} />
              <h2 className="font-bold text-slate-700">Galeri Foto Instalasi</h2>
            </div>
            <button 
              onClick={() => document.getElementById("upload-galeri").click()}
              disabled={isUploadingGallery}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors disabled:opacity-70 shadow-md shadow-blue-500/20"
            >
              {isUploadingGallery ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Tambah Foto
            </button>
            <input type="file" id="upload-galeri" accept="image/*" className="hidden" onChange={uploadGallery} />
          </div>
          
          <div className="p-6">
            {galeri.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm text-slate-500 font-medium">Belum ada foto di galeri. Klik tombol biru di atas untuk menambah.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {galeri.map((foto) => (
                  <div key={foto.id_cms_konten} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-200">
                    <img src={foto.url_gambar} alt="Galeri" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => deleteGallery(foto.id_cms_konten)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transform hover:scale-110 transition-all"
                        title="Hapus Foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
{/* KARTU 5: KONTAK WHATSAPP (ID 4 & 5) */}
{/* ================================================= */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
    <MessageCircle className="text-green-600" size={20} />
    <h2 className="font-bold text-slate-700">Kontak WhatsApp Admin</h2>
  </div>
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Admin 1</label>
      <input 
        type="text" 
        value={konten[4]?.content_value || ""}
        onChange={(e) => handleKontenChange(4, "content_value", e.target.value)}
        placeholder="Contoh: 628123456789"
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
      />
      <button 
        onClick={() => saveKonten(4)}
        disabled={isSaving === 4}
        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2"
      >
        {isSaving === 4 ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Admin 1
      </button>
    </div>

    <div>
      <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Admin 2</label>
      <input 
        type="text" 
        value={konten[5]?.content_value || ""}
        onChange={(e) => handleKontenChange(5, "content_value", e.target.value)}
        placeholder="Contoh: 628112233445"
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
      />
      <button 
        onClick={() => saveKonten(5)}
        disabled={isSaving === 5}
        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2"
      >
        {isSaving === 5 ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Admin 2
      </button>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}