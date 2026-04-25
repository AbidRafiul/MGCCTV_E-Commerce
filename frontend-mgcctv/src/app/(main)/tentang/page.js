import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import TentangSection from "@/section/users/tentang/TentangSection";

export const dynamic = "force-dynamic";

async function getCmsTentang() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/cms/tentang", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Gagal mengambil data CMS Tentang:", error);
    return []; 
  }
}

async function getCmsGaleri() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/cms/galeri", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Gagal mengambil data Galeri:", error);
    return []; 
  }
}

export default async function TentangKamiPage() {
  const [cmsData, galeriData] = await Promise.all([
    getCmsTentang(),
    getCmsGaleri()
  ]);

  const propsData = {
    tentangUtama: cmsData?.find(item => item.id_cms_konten === 1) || {},
    infoToko: cmsData?.find(item => item.id_cms_konten === 2) || {},
    lokasiToko: cmsData?.find(item => item.id_cms_konten === 3) || {},
    waAdmin1: cmsData?.find(item => item.id_cms_konten === 4)?.content_value || "6281234567890",
    waAdmin2: cmsData?.find(item => item.id_cms_konten === 5)?.content_value || "6281234567890",
    galeriData: galeriData || []
  };

  return (
    <>
      <Navbar />
      <TentangSection {...propsData} />
      <Footer />
    </>
  );
}