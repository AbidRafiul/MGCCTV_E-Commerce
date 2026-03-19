// src/app/(main)/layout.js
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <Footer />
    </>
  );
}