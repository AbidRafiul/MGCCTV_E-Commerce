"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Image as ImageIcon, Loader2, X, Crop as CropIcon } from "lucide-react";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";

// --- FUNGSI HELPER UNTUK MEMOTONG GAMBAR (CANVAS) ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped_image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
};

export default function EditBarangPage() {
  const router = useRouter();
  const { id } = useParams(); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [kategoriList, setKategoriList] = useState([]);
  
  const [form, setForm] = useState({
    nama_produk: "",
    deskripsi_produk: "",
    harga_produk: "",
    stok: "",
    ms_kategori_id_kategori: "",
  });

  // State untuk Gambar & Crop
  const [gambar, setGambar] = useState(null); 
  const [preview, setPreview] = useState(null); 
  
  const [imageSrc, setImageSrc] = useState(null); 
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const resKategori = await fetch("http://localhost:3000/api/admin/kategori", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resKategori.ok) setKategoriList(await resKategori.json());

        const resProduk = await fetch(`http://localhost:3000/api/admin/produk/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (resProduk.ok) {
          const data = await resProduk.json();
          setForm({
            nama_produk: data.nama_produk,
            deskripsi_produk: data.deskripsi_produk || "",
            harga_produk: data.harga_produk,
            stok: data.stok,
            ms_kategori_id_kategori: data.ms_kategori_id_kategori,
          });
          // Tampilkan gambar lama
          setPreview(data.gambar_produk);
        } else {
          Swal.fire("Error", "Data produk tidak ditemukan", "error");
          router.push("/admin/barang");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Saat admin memilih file foto baru
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setShowCropModal(true);
      e.target.value = ''; 
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      setGambar(croppedFile); 
      setPreview(URL.createObjectURL(croppedFile)); 
      setShowCropModal(false); 
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Gagal memotong gambar", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("nama_produk", form.nama_produk);
      formData.append("deskripsi_produk", form.deskripsi_produk);
      formData.append("harga_produk", form.harga_produk);
      formData.append("stok", form.stok);
      formData.append("ms_kategori_id_kategori", form.ms_kategori_id_kategori);
      
      if (gambar) {
        formData.append("gambar", gambar); 
      }

      const res = await fetch(`http://localhost:3000/api/admin/produk/${id}`, {
        method: "PUT", 
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengupdate produk");

      Swal.fire({
        title: "Berhasil!", text: "Data produk berhasil diperbarui.", icon: "success", confirmButtonColor: "#0C2C55"
      }).then(() => {
        router.push("/admin/barang");
      });

    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/barang" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Edit Produk</h1>
          <p className="text-sm text-slate-500">Perbarui informasi atau ganti foto produk CCTV.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* AREA UPLOAD GAMBAR */}
            <div className="col-span-1 space-y-4">
              <label className="text-sm font-bold text-slate-700 block">Foto Produk (1:1)</label>
              <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
                
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Klik untuk unggah foto</p>
                    <p className="text-xs text-slate-400 mt-1">Maksimal ukuran 2MB</p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <CropIcon size={16} /> Ganti/Crop Foto
                  </span>
                </div>
                
                <input 
                  id="fileInput"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* AREA INPUT TEKS */}
            <div className="col-span-1 md:col-span-2 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Nama Produk</label>
                <input type="text" name="nama_produk" value={form.nama_produk} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Merek</label>
                  <select name="ms_kategori_id_kategori" value={form.ms_kategori_id_kategori} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer" required>
                    {kategoriList.map((kat) => (
                      <option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Harga Jual (Rp)</label>
                  <input type="number" name="harga_produk" value={form.harga_produk} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Stok Saat Ini</label>
                  <input type="number" name="stok" value={form.stok} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Deskripsi Produk</label>
                <textarea name="deskripsi_produk" value={form.deskripsi_produk} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/admin/barang" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Batal</Link>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#0C2C55] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-900/20">
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================== */}
      {/* MODAL CROP GAMBAR */}
      {/* ============================================== */}
      {showCropModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Sesuaikan Gambar</h3>
              <button onClick={() => setShowCropModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="relative w-full h-[60vh] md:h-[400px] bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zoom</label>
                <input 
                  type="range" value={zoom} min={1} max={3} step={0.1}
                  aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCropModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors">Batal</button>
                <button onClick={handleCropImage} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Selesai Crop</button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}