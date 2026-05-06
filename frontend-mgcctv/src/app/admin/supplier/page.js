"use client";

import { useSupplier } from "@/hooks/admin/supplier/useSupplier";
import SupplierFormSection from "@/section/admin/supplier/SupplierFormSection";
import SupplierHeaderSection from "@/section/admin/supplier/SupplierHeaderSection";
import SupplierListSection from "@/section/admin/supplier/SupplierListSection";

export default function SupplierPage() {
  const {
    suppliers,
    filteredSuppliers,
    searchTerm,
    setSearchTerm,
    formData,
    selectedSupplier,
    isModalOpen,
    isLoading,
    isSaving,
    actionSupplierId,
    error,
    handleFormChange,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useSupplier();

  return (
    <div className="space-y-5 md:space-y-6">
      <SupplierHeaderSection
        totalSupplier={suppliers.length}
        filteredSupplier={filteredSuppliers.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openAddModal={openAddModal}
      />

      <SupplierListSection
        suppliers={filteredSuppliers}
        isLoading={isLoading}
        actionSupplierId={actionSupplierId}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
      />

      <SupplierFormSection
        isOpen={isModalOpen}
        formData={formData}
        selectedSupplier={selectedSupplier}
        isSaving={isSaving}
        error={error}
        onClose={closeModal}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
