"use client";

import { usePesanan } from "@/hooks/admin/pesanan/usePesanan";
import PesananSummarySection from "@/section/admin/pesanan/PesananSummarySection";
import PesananFilterSection from "@/section/admin/pesanan/PesananFilterSection";
import PesananTableSection from "@/section/admin/pesanan/PesananTableSection";

export default function PesananPage() {
  const {
    wrapperRef, loading, isExporting, summaryCards, tabs, activeTab, setActiveTab, search, setSearch,
    startDate, setStartDate, endDate, setEndDate, applyDateFilter, resetDateFilter, exportDateLabel, handleExportExcel,
    filteredOrders, paginatedOrders, currentPage, setCurrentPage, totalPages,
    openActionMenu, toggleActionMenu, updatingOrderId, handleChangeStatus
  } = usePesanan();

  return (
    <div ref={wrapperRef} className="p-5 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Kartu Rangkuman Atas */}
      <PesananSummarySection summaryCards={summaryCards} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* 2. Tab & Filter Search */}
        <PesananFilterSection 
          tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} 
          search={search} setSearch={setSearch}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          applyDateFilter={applyDateFilter} resetDateFilter={resetDateFilter}
          exportDateLabel={exportDateLabel} handleExportExcel={handleExportExcel}
          isExporting={isExporting}
        />

        {/* 3. Tabel & Pagination */}
        <PesananTableSection 
          loading={loading} paginatedOrders={paginatedOrders} filteredOrders={filteredOrders}
          currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
          openActionMenu={openActionMenu} toggleActionMenu={toggleActionMenu} 
          updatingOrderId={updatingOrderId} handleChangeStatus={handleChangeStatus}
        />

      </div>
    </div>
  );
}
