import { MessageCircle, Save, Loader2 } from "lucide-react";

export default function KontakSection({ konten, handleKontenChange, saveKonten, isSaving }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 xl:col-span-2">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <MessageCircle className="text-green-600" size={20} />
        <h2 className="font-bold text-slate-700">Kontak WhatsApp Admin</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Admin 1</label>
          <input type="text" value={konten[4]?.content_value || ""} onChange={(e) => handleKontenChange(4, "content_value", e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          <button onClick={() => saveKonten(4)} disabled={isSaving === 4} className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2">
            {isSaving === 4 ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Admin 1
          </button>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Admin 2</label>
          <input type="text" value={konten[5]?.content_value || ""} onChange={(e) => handleKontenChange(5, "content_value", e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          <button onClick={() => saveKonten(5)} disabled={isSaving === 5} className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2">
            {isSaving === 5 ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Admin 2
          </button>
        </div>
      </div>
    </div>
  );
}