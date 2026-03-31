// src/app/(main)/layout.js
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import { Toaster } from 'sonner';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <Footer />
      
      {/* TAMBAHKAN TOASTER DI SINI */}
      <Toaster position="top-center" richColors theme="light" />
    </>
  );
}