"use client";

import { useLaporanTransaksi } from "@/hooks/admin/laporan-transaksi/useLaporanTransaksi";
import LaporanHeaderSection from "@/section/admin/laporan-transaksi/LaporanHeaderSection";
import LaporanSummarySection from "@/section/admin/laporan-transaksi/LaporanSummarySection";
import LaporanTableSection from "@/section/admin/laporan-transaksi/LaporanTableSection";
import LaporanInsightSection from "@/section/admin/laporan-transaksi/LaporanInsightSection";

export default function LaporanTransaksiPage() {
  const {
    activeTab, setActiveTab, currentCards, currentTopProducts,
    transactions, restockTransactions, formatCurrency, toneStyles, statusStyles
  } = useLaporanTransaksi();

  return (
    <div className="space-y-6">
      {/* 1. Bagian Atas (Judul & Export) */}
      <LaporanHeaderSection />

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
        />
        
      </section>
    </div>
  );
}