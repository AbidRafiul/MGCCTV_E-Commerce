"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ensureCheckoutProfileComplete } from "@/services/checkoutProfileService";
import {
  getCartItems,
  removeCartItem,
  saveCheckoutItems,
  updateCartItemQuantity,
} from "@/services/cartService";

export default function CartList() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [popupConfig, setPopupConfig] = useState({ width: 360, padding: "1.25rem" });

  useEffect(() => {
    // Deteksi ukuran layar HANYA di client side agar tidak Hydration Error
    const updateConfig = () => {
      const isMobile = window.innerWidth < 640;
      setPopupConfig({
        width: isMobile ? 280 : 360,
        padding: isMobile ? "1rem" : "1.25rem"
      });
    };
    updateConfig();
    window.addEventListener("resize", updateConfig);

    const syncCartItems = () => {
      setLoading(true);
      try {
        const items = getCartItems();
        setCartItems(items);
        setSelectedIds((prev) =>
          prev.filter((id) => items.some((item) => item.id_produk === id)),
        );
      } catch (error) {
        console.error("Error fetching cart items:", error);
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

  const handleIncrease = (productId, currentQuantity) => {
    const targetItem = cartItems.find((item) => item.id_produk === productId);

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
    setCartItems(updatedItems);
  };

  const handleDecrease = (productId, currentQuantity) => {
    const updatedItems = updateCartItemQuantity(productId, currentQuantity - 1);
    setCartItems(updatedItems);
    setSelectedIds((prev) =>
      prev.filter((id) => updatedItems.some((item) => item.id_produk === id)),
    );
  };

  const handleRemove = (productId) => {
    const updatedItems = removeCartItem(productId);
    setCartItems(updatedItems);
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
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(cartItems.map((item) => item.id_produk));
  };

  const handleCheckout = async () => {
    const selectedItems = cartItems.filter((item) =>
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

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const selectedItems = cartItems.filter((item) =>
    selectedIds.includes(item.id_produk),
  );
  const selectedTotal = selectedItems.reduce(
    (total, item) => total + item.harga_produk * item.quantity,
    0,
  );
  const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  // Animasi Framer
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[32px] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm sm:text-base">Membuka keranjang belanja...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[32px] border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm px-5 py-20 text-center shadow-sm"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-24 sm:w-24">
          <ShoppingCart size={36} className="sm:w-10 sm:h-10" />
        </div>
        <h2 className="mt-6 text-xl font-extrabold text-slate-900 sm:text-2xl">
          Keranjang masih kosong
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          Temukan berbagai produk CCTV berkualitas dan masukkan ke keranjang Anda sekarang.
        </p>
        <button 
          onClick={() => router.push("/produk")}
          className="mt-8 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all hover:-translate-y-1"
        >
          Mulai Belanja
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* KIRI: Daftar Produk (Takes up 7/12 width on Desktop) */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="w-full lg:w-7/12 space-y-4 sm:space-y-5"
      >
        <AnimatePresence>
          {cartItems.map((item) => {
            const isSelected = selectedIds.includes(item.id_produk);
            const isMaxStockReached =
              item.stok_tersedia !== null &&
              item.stok_tersedia !== undefined &&
              item.quantity >= item.stok_tersedia;

            return (
              <motion.div
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={item.id_produk}
                className={`group relative rounded-[28px] bg-white p-5 sm:p-6 shadow-sm ring-1 transition-all hover:shadow-xl hover:shadow-slate-200/50 ${
                  isSelected ? "ring-blue-500 bg-blue-50/10" : "ring-slate-100"
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  
                  {/* Bagian Kiri: Checkbox & Gambar */}
                  <div className="flex items-start sm:items-center gap-4">
                    <label className="flex shrink-0 cursor-pointer items-center mt-6 sm:mt-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id_produk)}
                        className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2 border border-slate-100 group-hover:bg-white transition-colors">
                      <img
                        src={item.gambar_produk || "/images/placeholder.jpg"}
                        alt={item.nama_produk}
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Bagian Tengah: Info Produk */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="inline-block bg-slate-900 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                      {item.merek || "MGCCTV"}
                    </span>
                    <h2 className="text-base font-bold leading-tight text-slate-900 sm:text-lg line-clamp-2">
                      {item.nama_produk}
                    </h2>
                    <p className="text-sm font-black text-blue-600 sm:text-base">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.harga_produk)}
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Aksi Quantity & Hapus */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id_produk)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>

                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item.id_produk, item.quantity)}
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex h-9 sm:h-10 w-10 sm:w-12 items-center justify-center bg-white px-2 text-sm sm:text-base font-bold text-slate-900 border-x border-slate-200">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item.id_produk, item.quantity)}
                      disabled={isMaxStockReached}
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ========================================================= */}
      {/* KANAN: Ringkasan Belanja (Takes up 5/12 width on Desktop) */}
      {/* ========================================================= */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="w-full lg:w-5/12 lg:sticky lg:top-24"
      >
        <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            Ringkasan Belanja
          </h3>
          
          <div className="space-y-4 mb-6 text-sm sm:text-base">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Total Item</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-lg">{totalItems} Barang</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Item Terpilih</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">{selectedItems.length} Barang</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-900 font-bold">Total Harga</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(selectedTotal)}
              </span>
            </div>
          </div>

          {/* Jaminan Keamanan */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-start gap-3 mb-6 border border-emerald-100">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
              Transaksi Anda aman dan dilindungi. Seluruh produk bergaransi resmi.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="w-full inline-flex h-12 sm:h-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600"
            >
              <CheckCircle2 size={18} className="mr-2" />
              {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua Produk"}
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full inline-flex h-12 sm:h-14 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1"
            >
              Lanjutkan ke Pembayaran
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}