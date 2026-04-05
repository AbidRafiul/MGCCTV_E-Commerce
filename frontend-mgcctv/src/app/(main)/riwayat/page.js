"use client"

import HistoryCard from "@/components/riwayat/HistoryCard";
import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";   

export default function HistoryPage() {
    return (
        <AuthGuard>
            <Navbar />
            <HistoryCard />
            <Footer />
        </AuthGuard>
    );
}
