import { Image as ImageIcon, Plus, Loader2, Trash2 } from "lucide-react";

export default function GaleriSection({ galeri, isUploadingGallery, handleFileChange, deleteGallery }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-700">Galeri Foto Instalasi (1:1)</h2>
        </div>
        <button 
          onClick={() => document.getElementById("upload-galeri").click()} disabled={isUploadingGallery}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-md disabled:opacity-70"
        >
          {isUploadingGallery ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Tambah Foto
        </button>
        <input type="file" id="upload-galeri" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'galeri')} />
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
                  <button onClick={() => deleteGallery(foto.id_cms_konten)} className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transform hover:scale-110 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}