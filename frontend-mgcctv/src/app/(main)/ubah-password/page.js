import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import PassHero from "@/components/ubahPass/PassHero";

export default function Page() {
  return (
    <AuthGuard>
      <Navbar />
      <PassHero />
      <Footer />
    </AuthGuard>
  );
}
