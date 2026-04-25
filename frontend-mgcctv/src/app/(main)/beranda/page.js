"use client";

import HeroSection from "@/section/users/home/HeroSection";
import WhyUsSection from "@/section/users/home/WhyUsSection";
import FeaturedProductsSection from "@/section/users/home/FeaturedProductsSection";
import { useFeaturedProducts } from "@/hooks/users/home/useFeaturedProducts";

export default function HomePage() {
  const { products, isLoading, scrollProgress, handleScroll, formatRupiah } = useFeaturedProducts();

  return (
    <main>
      <HeroSection />
      <WhyUsSection />
      <FeaturedProductsSection 
        products={products}
        isLoading={isLoading}
        scrollProgress={scrollProgress}
        handleScroll={handleScroll}
        formatRupiah={formatRupiah}
      />
    </main>
  );
}