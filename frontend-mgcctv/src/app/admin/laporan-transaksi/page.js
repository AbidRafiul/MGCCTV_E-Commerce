"use client";

import { useLaporanTransaksi } from "@/hooks/admin/laporan-transaksi/useLaporanTransaksi";
import LaporanHeaderSection from "@/section/admin/laporan-transaksi/LaporanHeaderSection";
import LaporanSummarySection from "@/section/admin/laporan-transaksi/LaporanSummarySection";
import LaporanTableSection from "@/section/admin/laporan-transaksi/LaporanTableSection";
import LaporanInsightSection from "@/section/admin/laporan-transaksi/LaporanInsightSection";

export default function LaporanTransaksiPage() {
  const {
    isLoading, isExporting, error,
    startDate, setStartDate, endDate, setEndDate, applyDateFilter, resetDateFilter, exportReportToExcel, dateRangeLabel,
    activeTab, setActiveTab, currentCards, currentTopProducts,
    transactions, restockTransactions, formatCurrency, toneStyles, statusStyles
  } = useLaporanTransaksi();

  return (
    <div className="space-y-6">
      {/* 1. Bagian Atas (Judul & Export) */}
      <LaporanHeaderSection
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        applyDateFilter={applyDateFilter}
        resetDateFilter={resetDateFilter}
        exportReportToExcel={exportReportToExcel}
        isExporting={isExporting}
        dateRangeLabel={dateRangeLabel}
      />

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">Memuat laporan transaksi dari database...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-10 shadow-sm">
          <p className="text-lg font-bold text-red-600">Laporan gagal dimuat</p>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <>
      {/* 2. Kartu Rangkuman (4 Kotak) */}
      <LaporanSummarySection currentCards={currentCards} toneStyles={toneStyles} />

      {/* 3. Konten Utama (Tabel Kiri & Info Kanan) */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        
        <LaporanTableSection 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          transactions={transactions} 
          restockTransactions={restockTransactions} 
          formatCurrency={formatCurrency} 
          statusStyles={statusStyles} 
        />
        
        <LaporanInsightSection 
          activeTab={activeTab} 
          currentTopProducts={currentTopProducts} 
          formatCurrency={formatCurrency}
        />
        
      </section>
        </>
      )}
    </div>
  );
}
