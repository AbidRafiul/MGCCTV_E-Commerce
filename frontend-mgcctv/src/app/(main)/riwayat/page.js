"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import HistorySection from "@/section/users/riwayat/HistorySection";
import { useHistory } from "@/hooks/users/riwayat/useHistory";

export default function HistoryPage() {
  const historyState = useHistory();

  return (
    <AuthGuard>
      <Navbar />
      <HistorySection {...historyState} />
      <Footer />
    </AuthGuard>
  );
}