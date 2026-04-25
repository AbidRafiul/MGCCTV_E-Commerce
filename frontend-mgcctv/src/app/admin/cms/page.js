"use client";

import { Loader2 } from "lucide-react";

// 1. Panggil Otak Logika dari Custom Hook
import { useCMS } from "@/hooks/admin/cms/useCMS";

// 2. Panggil Kepingan UI
import BannerSection from "@/section/admin/cms/BannerSection";
import InfoSection from "@/section/admin/cms/InfoSection";
import GaleriSection from "@/section/admin/cms/GaleriSection";
import KontakSection from "@/section/admin/cms/KontakSection";
import CropModal from "@/components/admin/cms/modals/CropModal";

export default function CMSAdminPage() {
  // 3. Ekstrak semua senjata dari Hook dalam 1 baris
  const {
    isLoading,
    isSaving,
    konten,
    galeri,
    isUploadingGallery,
    showCropModal,
    setShowCropModal,
    cropTarget,
    imageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    onCropComplete,
    handleKontenChange,
    handleFileChange,
    handleCropImage,
    saveKonten,
    deleteGallery,
  } = useCMS();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 4. Render UI yang sangat rapi
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Manajemen Konten (CMS)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola informasi toko, galeri, dan lokasi yang tampil di halaman
          Tentang Kami.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <BannerSection
          konten={konten}
          handleKontenChange={handleKontenChange}
          handleFileChange={handleFileChange}
          saveKonten={saveKonten}
          isSaving={isSaving}
        />

        <InfoSection
          konten={konten}
          handleKontenChange={handleKontenChange}
          saveKonten={saveKonten}
          isSaving={isSaving}
        />

        <GaleriSection
          galeri={galeri}
          isUploadingGallery={isUploadingGallery}
          handleFileChange={handleFileChange}
          deleteGallery={deleteGallery}
        />

        <KontakSection
          konten={konten}
          handleKontenChange={handleKontenChange}
          saveKonten={saveKonten}
          isSaving={isSaving}
        />
      </div>

      <CropModal
        showCropModal={showCropModal}
        setShowCropModal={setShowCropModal}
        cropTarget={cropTarget}
        imageSrc={imageSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onCropComplete={onCropComplete}
        handleCropImage={handleCropImage}
        isUploadingGallery={isUploadingGallery}
      />
    </div>
  );
}
