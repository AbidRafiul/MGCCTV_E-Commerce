import { Info, Save, Loader2 } from "lucide-react";

export default function InfoSection({ konten, handleKontenChange, saveKonten, isSaving }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Info className="text-blue-600" size={20} /> <h2 className="font-bold text-slate-700">Jam Operasional & Info</h2>
      </div>
      <div className="p-6">
        <textarea rows="4" value={konten[2].content_value} onChange={(e) => handleKontenChange(2, "content_value", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
        <div className="flex justify-end mt-4">
          <button onClick={() => saveKonten(2)} disabled={isSaving === 2} className="flex items-center gap-2 bg-[#0C2C55] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            {isSaving === 2 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Info
          </button>
        </div>
      </div>
    </div>
  );
}