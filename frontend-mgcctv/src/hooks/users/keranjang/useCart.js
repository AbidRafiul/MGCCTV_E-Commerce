"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ensureCheckoutProfileComplete } from "@/services/checkoutProfileService";
import {
  getCartItems,
  removeCartItem,
  saveCheckoutItems,
  updateCartItemQuantity,
} from "@/services/cartService";

export const useCart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [popupConfig, setPopupConfig] = useState({ width: 360, padding: "1.25rem" });

  useEffect(() => {
    const updateConfig = () => {
      const isMobile = window.innerWidth < 640;
      setPopupConfig({
        width: isMobile ? 280 : 360,
        padding: isMobile ? "1rem" : "1.25rem"
      });
    };
    updateConfig();
    window.addEventListener("resize", updateConfig);

    // Tambahkan kata 'async' di sini
    const syncCartItems = async () => { 
      setLoading(true);
      try {
        // Tambahkan kata 'await' di sini biar dia nungguin data dari backend selesai dikirim
        const items = await getCartItems(); 
        
        // Pengaman tetap kita pakai biar makin kebal
        const validItems = Array.isArray(items) ? items : []; 
        
        setCartItems(validItems);
        setSelectedIds((prev) =>
          prev.filter((id) => validItems.some((item) => item.id_produk === id)),
        );
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setCartItems([]); 
      } finally {
        setLoading(false);
      }
    };  

    syncCartItems();
    window.addEventListener("cart-updated", syncCartItems);

    return () => {
      window.removeEventListener("resize", updateConfig);
      window.removeEventListener("cart-updated", syncCartItems);
    };
  }, []);

  // PENGAMAN 2: Pastikan state terbaca sebagai Array sebelum fungsi lain jalan
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handleIncrease = (productId, currentQuantity) => {
    const targetItem = safeCartItems.find((item) => item.id_produk === productId);

    if (
      targetItem?.stok_tersedia !== null &&
      targetItem?.stok_tersedia !== undefined &&
      currentQuantity >= targetItem.stok_tersedia
    ) {
      toast.warning("Stok Maksimal Tercapai", {
        description: `Hanya tersisa ${targetItem.stok_tersedia} unit untuk produk ini.`,
      });
      return;
    }

    const updatedItems = updateCartItemQuantity(productId, currentQuantity + 1);
    setCartItems(Array.isArray(updatedItems) ? updatedItems : []);
  };

  const handleDecrease = (productId, currentQuantity) => {
    const updatedItems = updateCartItemQuantity(productId, currentQuantity - 1);
    const validUpdated = Array.isArray(updatedItems) ? updatedItems : [];
    
    setCartItems(validUpdated);
    setSelectedIds((prev) =>
      prev.filter((id) => validUpdated.some((item) => item.id_produk === id)),
    );
  };

  const handleRemove = (productId) => {
    const updatedItems = removeCartItem(productId);
    setCartItems(Array.isArray(updatedItems) ? updatedItems : []);
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
  };

  const toggleSelectItem = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === safeCartItems.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(safeCartItems.map((item) => item.id_produk));
  };

  const handleCheckout = async () => {
    const selectedItems = safeCartItems.filter((item) =>
      selectedIds.includes(item.id_produk),
    );

    if (selectedItems.length === 0) {
      toast.error("Pilih Produk Dulu", {
        description: "Centang minimal satu produk sebelum melanjutkan ke pembayaran.",
      });
      return;
    }

    const canContinue = await ensureCheckoutProfileComplete();

    if (!canContinue) {
      return;
    }

    saveCheckoutItems(selectedItems);
    router.push("/checkout");
  };

  // PENGAMAN 3: Kalkulasi menggunakan array yang sudah dipastikan aman
  const totalItems = safeCartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  
  const selectedItems = safeCartItems.filter((item) =>
    selectedIds.includes(item.id_produk),
  );
  
  const selectedTotal = selectedItems.reduce(
    (total, item) => total + (item.harga_produk * (item.quantity || 1)),
    0,
  );
  
  const isAllSelected = safeCartItems.length > 0 && selectedIds.length === safeCartItems.length;

  return {
    router,
    cartItems: safeCartItems, // Lempar array yang sudah aman ke UI
    selectedIds, loading, popupConfig,
    handleIncrease, handleDecrease, handleRemove, 
    toggleSelectItem, handleToggleSelectAll, handleCheckout,
    totalItems, selectedItems, selectedTotal, isAllSelected
  };
};