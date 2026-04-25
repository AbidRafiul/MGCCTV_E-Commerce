"use client";

import { useProductList } from "@/hooks/users/produk/useProductList";
import ProductHeaderSection from "@/section/users/produk/ProductHeaderSection";
import ProductListSection from "@/section/users/produk/ProductListSection";

export default function ProdukPage() {
  const katalogState = useProductList();

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <ProductHeaderSection />
      
      <ProductListSection 
        {...katalogState}
      />
    </main>
  );
}