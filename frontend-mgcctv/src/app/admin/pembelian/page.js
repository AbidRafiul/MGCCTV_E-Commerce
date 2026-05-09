"use client";

import { Loader2, Trash2 } from "lucide-react";
import { usePembelian } from "@/hooks/admin/pembelian/usePembelian";

// Sections
import PembelianHeaderSection from "@/section/admin/pembelian/PembelianHeaderSection";
import PembelianSummarySection from "@/section/admin/pembelian/PembelianSummarySection";
import PembelianTableSection from "@/section/admin/pembelian/PembelianTableSection";
import PembelianFormSection from "@/section/admin/pembelian/PembelianFormSection";
import PembelianRecentOrdersSection from "@/section/admin/pembelian/PembelianRecentOrdersSection";
import PembelianDetailDialogSection from "@/section/admin/pembelian/PembelianDetailDialogSection";

// UI Components
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PembelianPage() {
  const {
    products, suppliers, purchases, isLoading, error, formData, itemFormData, formTotal, isFormOpen, detailDialog, deleteDialog,
    deletingId, isSubmitting, feedbackDialog, setFeedbackDialog, setDeleteDialog, openCreateForm, closeCreateForm,
    handleFormChange, handleItemChange, addItemRow, removeItemRow, handleFormSubmit, handleItemSubmit, openPurchaseDetail,
    closePurchaseDetail, deletePurchase, confirmDeletePurchase, inventoryStats, latestPurchases, feedbackMeta,
    formatCurrency, formatNumber, formatDateTime
  } = usePembelian();

  const FeedbackIcon = feedbackMeta.icon;

  return (
    <>
      <div className="space-y-6">
        <PembelianHeaderSection openCreateForm={openCreateForm} />

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={18} />
              <span>Memuat data stok produk...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-10 shadow-sm">
            <p className="text-lg font-bold text-red-600">Data inventori gagal dimuat</p>
            <p className="mt-2 text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <PembelianSummarySection inventoryStats={inventoryStats} formatNumber={formatNumber} />

            {/* Layout Grid: Kiri Tabel (Besar), Kanan Form & Pesanan (Kecil) */}
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)]">
              <PembelianTableSection
                purchases={purchases}
                deletingId={deletingId}
                openPurchaseDetail={openPurchaseDetail}
                deletePurchase={deletePurchase}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatDateTime={formatDateTime}
              />
              
              <div className="space-y-6">
                <PembelianFormSection 
                  suppliers={suppliers}
                  formData={formData}
                  isFormOpen={isFormOpen}
                  closeCreateForm={closeCreateForm}
                  handleFormChange={handleFormChange}
                  handleFormSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                />
                <PembelianRecentOrdersSection 
                  latestPurchases={latestPurchases}
                  formatNumber={formatNumber} formatCurrency={formatCurrency} 
                />
              </div>
            </section>
          </>
        )}
      </div>

      <PembelianDetailDialogSection
        detailDialog={detailDialog}
        products={products}
        itemFormData={itemFormData}
        formTotal={formTotal}
        closePurchaseDetail={closePurchaseDetail}
        handleItemChange={handleItemChange}
        addItemRow={addItemRow}
        removeItemRow={removeItemRow}
        handleItemSubmit={handleItemSubmit}
        isSubmitting={isSubmitting}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        formatDateTime={formatDateTime}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !deletingId) setDeleteDialog({ open: false, purchase: null });
        }}
      >
        <AlertDialogContent className="max-w-md rounded-[24px] border border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <AlertDialogHeader className="px-6 pt-6 text-left sm:place-items-start sm:text-left">
            <AlertDialogMedia className="size-12 rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold text-[#0C2C55]">
              Hapus Pembelian?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-slate-500">
              Faktur {deleteDialog.purchase?.no_faktur || `#${deleteDialog.purchase?.id_pembelian || ""}`} akan dihapus. Stok barang akan dikurangi sesuai trigger database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-[24px] border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            <AlertDialogCancel
              disabled={Boolean(deletingId)}
              className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePurchase}
              disabled={Boolean(deletingId)}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FEEDBACK DIALOG */}
      <AlertDialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent className="max-w-md rounded-[24px] border border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <AlertDialogHeader className="px-6 pt-6 text-left sm:place-items-start sm:text-left">
            <AlertDialogMedia className={`size-12 rounded-2xl ${feedbackMeta.mediaClass}`}>
              <FeedbackIcon size={22} />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold text-[#0C2C55]">
              {feedbackDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-slate-500">
              {feedbackDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-[24px] border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            <AlertDialogAction
              onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}
              className={`w-full rounded-xl text-white sm:w-auto ${feedbackMeta.buttonClass}`}
            >
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
