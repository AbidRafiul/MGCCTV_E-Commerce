import Hero from "@/components/home/Hero";
import WhyUs from "@/components/home/WhyUs";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function HomeSection({ cmsData }) {
  // Kita cari data spesifik berdasarkan "section_name" yang ada di database kamu.
  // Pastikan string "Banner Utama" dan "Kenapa Kami" sesuai dengan yang kamu ketik di panel Admin CMS ya!
  
  const heroData = cmsData?.find(item => item.section_name === "Banner Utama") || {};
  const whyUsData = cmsData?.find(item => item.section_name === "Kenapa Kami") || {};
  const promoData = cmsData?.find(item => item.section_name === "Promo Khusus") || {}; 

  return (
    <>
      {/* Lempar data yang sudah disaring ke masing-masing komponen */}
      <Hero data={heroData} />
      
      <WhyUs data={whyUsData} />
      
      <FeaturedProducts data={promoData} />
    </>
  );
}