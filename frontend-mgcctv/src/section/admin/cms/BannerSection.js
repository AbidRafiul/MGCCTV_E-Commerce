import { Save, Store, Image as ImageIcon, Crop as CropIcon, Loader2 } from "lucide-react";

export default function BannerSection({ konten, handleKontenChange, handleFileChange, saveKonten, isSaving }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Store className="text-blue-600" size={20} />
        <h2 className="font-bold text-slate-700">Banner & Sejarah Toko</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <label className="text-sm font-bold text-slate-700 block mb-3">Foto Toko / Banner (16:9)</label>
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
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <CropIcon size={14} /> Ganti/Crop
              </span>
            </div>
          </div>
          <input type="file" id="upload-tentang" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} />
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <label className="text-sm font-bold text-slate-700 block mb-3">Deskripsi / Sejarah Singkat</label>
          <textarea 
            rows="6" value={konten[1].content_value} onChange={(e) => handleKontenChange(1, "content_value", e.target.value)}
            placeholder="Tuliskan sejarah toko atau penjelasan layanan Anda..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none grow"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button onClick={() => saveKonten(1)} disabled={isSaving === 1} className="flex items-center gap-2 bg-[#0C2C55] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70">
              {isSaving === 1 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Bagian Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}