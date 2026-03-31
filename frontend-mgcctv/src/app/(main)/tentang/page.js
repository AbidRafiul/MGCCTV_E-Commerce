import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import { Clock, MapPin, ShieldCheck, MessageCircle, CheckCircle2 } from "lucide-react";

// Import komponen Slider Galeri yang baru kita buat
import GallerySlider from "./GallerySlider";

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

  const tentangUtama = cmsData?.find(item => item.id_cms_konten === 1) || {};
  const infoToko = cmsData?.find(item => item.id_cms_konten === 2) || {};
  const lokasiToko = cmsData?.find(item => item.id_cms_konten === 3) || {};
  
  const waAdmin1 = cmsData?.find(item => item.id_cms_konten === 4)?.content_value || "6281234567890";
  const waAdmin2 = cmsData?.find(item => item.id_cms_konten === 5)?.content_value || "6281234567890";

  const defaultImage = "https://images.unsplash.com/photo-1558002038-1055907df827";

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-slate-50 pb-20 pt-16">
        
        {/* HERO SECTION */}
        <section className="bg-[#0C2C55] pt-24 pb-24 px-6 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Tentang <span className="text-blue-400">Kami</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Mengenal lebih dekat MG CCTV, mitra terpercaya Anda dalam menghadirkan solusi keamanan properti.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 md:px-8 -mt-12 relative z-20 space-y-12 md:space-y-20">

          {/* SECTION TENTANG UTAMA */}
          <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-blue-900/5 border border-slate-100">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="relative aspect-video md:aspect-[4/3] w-full rounded-2xl overflow-hidden group">
                <img 
                  src={tentangUtama.url_gambar || defaultImage} 
                  alt="MG CCTV Shop" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2C55] mb-4">
                  Solusi Keamanan Profesional
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6 whitespace-pre-wrap">
                  {tentangUtama.content_value || "Deskripsi belum diatur."}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700 font-medium text-sm md:text-base">
                    <ShieldCheck size={20} className="text-blue-600" /> Produk Bergaransi Resmi
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium text-sm md:text-base">
                    <CheckCircle2 size={20} className="text-blue-600" /> Teknisi Berpengalaman
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION GALERI - Menggunakan Komponen Slider Baru! */}
          <section>
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0C2C55] tracking-tight">Galeri Kami</h2>
              <div className="w-16 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <GallerySlider galeriData={galeriData} />
            
          </section>

          {/* SECTION INFO & LOKASI */}
          <section className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* KARTU 1: INFO TOKO */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="bg-[#0C2C55] py-4 px-6 text-center">
                <h3 className="text-xl font-bold text-white tracking-wide">Informasi Toko</h3>
              </div>
              <div className="p-6 md:p-8 flex flex-col grow justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-[#0C2C55] font-bold mb-2">
                      <Clock size={18} className="text-blue-600" /> Jam Operasional
                    </h4>
                    <p className="text-slate-600 text-sm ml-7 whitespace-pre-wrap">
                      {infoToko.content_value || "Belum diatur"}
                    </p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-[#0C2C55] font-bold mb-2">
                      <ShieldCheck size={18} className="text-blue-600" /> Layanan Kami
                    </h4>
                    <p className="text-slate-600 text-sm ml-7 leading-relaxed">
                      Layanan instalasi CCTV profesional untuk Madiun dan sekitarnya.
                    </p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`https://wa.me/${waAdmin1.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-500/20 active:scale-95"
                    >
                      <MessageCircle size={18} /> Admin 1
                    </a>
                    <a 
                      href={`https://wa.me/${waAdmin2.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-500/20 active:scale-95"
                    >
                      <MessageCircle size={18} /> Admin 2
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* KARTU 2: LOKASI */}
<div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
  <div className="bg-[#0C2C55] py-4 px-6 text-center">
    <h3 className="text-xl font-bold text-white tracking-wide">Lokasi Kami</h3>
  </div>
  <div className="p-6 md:p-8 flex flex-col grow space-y-6">
    <div className="flex items-start gap-3">
      <MapPin size={24} className="text-blue-600 shrink-0" />
      <p className="text-slate-600 text-sm leading-relaxed">
        <span className="font-bold text-[#0C2C55] block mb-1">Madiun, Jawa Timur</span>
        {/* Alamat tetap ambil dari CMS agar fleksibel */}
        {lokasiToko.content_value || "Alamat belum diatur."}
      </p>
    </div>
    
    {/* BAGIAN MAP DI-HARDCODE KE LOKASI MADIUN */}
    <div className="w-full bg-slate-100 rounded-2xl overflow-hidden grow min-h-[250px] border border-slate-200">
        <iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.5138243623346!2d111.53108757605332!3d-7.627756875430821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79bfa50bfad8dd%3A0xd91b9465d702759b!2sMG%20CCTV%20Partner%20Madiun!5e0!3m2!1sid!2sid!4v1774859104828!5m2!1sid!2sid" 
  className="w-full h-full border-0 min-h-[300px]" 
  allowFullScreen={true} 
  loading="lazy" 
  referrerPolicy="no-referrer-when-downgrade" 
  title="Lokasi MG CCTV Madiun"
></iframe>
    </div>
  </div>
</div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}