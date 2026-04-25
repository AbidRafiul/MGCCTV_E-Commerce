"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import TransaksiSection from "@/section/users/transaksi/TransaksiSection";
import { useTransaksi } from "@/hooks/users/transaksi/useTransaksi";

export default function TransaksiPage() {
  const transaksiState = useTransaksi();

  return (
    <AuthGuard>
      <Navbar />
      <TransaksiSection {...transaksiState} />
      <Footer />
    </AuthGuard>
  );
}