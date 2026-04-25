import { X, Crop as CropIcon, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";

export default function CropModal({ 
  showCropModal, setShowCropModal, cropTarget, imageSrc, 
  crop, setCrop, zoom, setZoom, onCropComplete, 
  handleCropImage, isUploadingGallery 
}) {
  if (!showCropModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Sesuaikan Gambar {cropTarget === 'banner' ? 'Banner (16:9)' : 'Galeri (1:1)'}
          </h3>
          <button onClick={() => setShowCropModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="relative w-full h-[60vh] md:h-[400px] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={cropTarget === 'banner' ? 16 / 9 : 1}
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
            <button 
              onClick={handleCropImage} disabled={isUploadingGallery}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-70"
            >
              {isUploadingGallery ? <Loader2 size={16} className="animate-spin" /> : <CropIcon size={16} />} 
              Selesai Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}