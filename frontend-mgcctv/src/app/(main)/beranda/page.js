import HomeSection from "@/section/home/homeSection";

// Fungsi untuk mengambil data CMS dari backend
async function getCmsBeranda() {
  try {
    // Gunakan cache: 'no-store' agar Next.js selalu mengambil data terbaru 
    const res = await fetch("http://localhost:3000/api/admin/cms/beranda", {
      cache: "no-store", 
    });
    
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Gagal mengambil data CMS Beranda:", error);
    return [];
  }
}

export default async function BerandaPage() {
  const dataCms = await getCmsBeranda();

  // Lempar dataCms ke HomeSection
  return <HomeSection cmsData={dataCms} />;
}