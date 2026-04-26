import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ensureCheckoutProfileComplete, saveProfileCompletion } from "@/services/checkoutProfileService";
import { addCartItem, saveCheckoutItems } from "@/services/cartService";

export const useProductDetail = (product) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfileToComplete, setUserProfileToComplete] = useState(null);

  const redirectToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname || "/produk")}`);
  };

  const handleAddToCart = async () => {
    try {
      await addCartItem(product);
      router.push("/keranjang");
    } catch (error) {
      if (error?.status === 401) {
        redirectToLogin();
        return;
      }
      Swal.fire({
        title: "Keranjang Gagal Diperbarui",
        text: error?.message || "Terjadi kesalahan saat menambahkan produk.",
        icon: "error",
        confirmButtonColor: "#0C2C55",
      });
    }
  };

  const proceedToCheckout = () => {
    saveCheckoutItems([{ ...product, quantity: 1 }]);
    router.push("/checkout");
  };

  const handleBuyNow = async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      redirectToLogin();
      return;
    }

    const { isComplete, profile } = await ensureCheckoutProfileComplete();

    if (!isComplete) {
      if (profile) {
        setUserProfileToComplete(profile);
        setIsProfileModalOpen(true);
      } else {
        Swal.fire({
          title: "Sesi Berakhir",
          text: "Silakan login kembali untuk melanjutkan.",
          icon: "error",
          confirmButtonColor: "#0C2C55"
        });
        redirectToLogin();
      }
      return;
    }

    proceedToCheckout();
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await saveProfileCompletion({ token, ...updatedData });
      setIsProfileModalOpen(false); 
      proceedToCheckout(); 
      return true; 
    } catch (error) {
      return false; 
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return {
    isProfileModalOpen, setIsProfileModalOpen,
    userProfileToComplete,
    handleAddToCart, handleBuyNow, handleSaveProfile,
    formatRupiah, fadeUpVariant
  };
};