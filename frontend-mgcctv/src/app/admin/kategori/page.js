"use client";

import { useKategori } from "@/hooks/admin/kategori/useKategori";
import KategoriFormSection from "@/section/admin/kategori/KategoriFormSection";
import KategoriListSection from "@/section/admin/kategori/KategoriListSection";

export default function KategoriPage() {
  const {
    kategori, namaKategori, setNamaKategori, editingKategoriId,
    isLoading, isSaving, actionKategoriId, error, success,
    handleSubmit, handleEdit, handleCancelEdit, handleDelete
  } = useKategori();

  return (
    <div className="space-y-6">
      <KategoriFormSection
        namaKategori={namaKategori}
        setNamaKategori={setNamaKategori}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        editingKategoriId={editingKategoriId}
        handleCancelEdit={handleCancelEdit}
        error={error}
        success={success}
      />
      
      <KategoriListSection
        kategori={kategori}
        isLoading={isLoading}
        editingKategoriId={editingKategoriId}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        actionKategoriId={actionKategoriId}
      />
    </div>
  );
}