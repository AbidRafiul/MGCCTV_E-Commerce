import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import { Clock, MapPin, ShieldCheck, MessageCircle, CheckCircle2, Wrench, Info } from "lucide-react";
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
      
      <main className="min-h-screen bg-slate-50 pb-20 pt-16 font-sans">
        
        {/* ========================================= */}
        {/* HERO SECTION (Selaras dengan Beranda) */}
        {/* ========================================= */}
        <section className="bg-slate-900 pt-24 pb-32 px-6 relative overflow-hidden text-center">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="mb-4 inline-block rounded-full bg-blue-500/20 border border-blue-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 backdrop-blur-md">
              Profil Perusahaan
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Lebih Dekat Dengan <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                MGCCTV
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
              Mitra terpercaya Anda dalam menghadirkan solusi keamanan properti dengan teknologi terdepan dan layanan instalasi profesional.
            </p>
          </div>
        </section>

        {/* ========================================= */}
        {/* MAIN CONTENT WRAPPER (Melingkupi Card) */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 -mt-16 relative z-20 space-y-16 md:space-y-24">

          {/* SECTION TENTANG UTAMA */}
          <section className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
              <div className="relative aspect-video md:aspect-[4/3] w-full rounded-3xl overflow-hidden group bg-slate-100 border border-slate-200/50">
                <img 
                  src={tentangUtama.url_gambar || defaultImage} 
                  alt="MG CCTV Shop" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
                  Solusi Keamanan <span className="text-blue-600">Profesional</span>
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-8 whitespace-pre-wrap">
                  {tentangUtama.content_value || "Deskripsi belum diatur."}
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 font-bold text-sm md:text-base">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0"><ShieldCheck size={20} /></div> 
                      Produk Bergaransi Resmi
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 font-bold text-sm md:text-base">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0"><Wrench size={20} /></div> 
                      Teknisi Berpengalaman
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION INFO & LOKASI (Grid 2 Kolom) */}
          <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            
            {/* KARTU 1: INFO TOKO */}
            <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:ring-blue-100">
              <div className="p-8 md:p-10 flex flex-col grow justify-between space-y-8">
                <div className="space-y-8">
                  <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                    <Info className="text-blue-600" size={28} /> Informasi Toko
                  </h3>
                  
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="flex items-center gap-2 text-slate-900 font-bold mb-2 text-sm md:text-base">
                        <Clock size={18} className="text-blue-600" /> Jam Operasional
                      </h4>
                      <p className="text-slate-600 text-sm md:text-base ml-7 whitespace-pre-wrap leading-relaxed">
                        {infoToko.content_value || "Belum diatur"}
                      </p>
                    </div>
                    <div className="h-px bg-slate-200"></div>
                    <div>
                      <h4 className="flex items-center gap-2 text-slate-900 font-bold mb-2 text-sm md:text-base">
                        <ShieldCheck size={18} className="text-blue-600" /> Layanan Kami
                      </h4>
                      <p className="text-slate-600 text-sm md:text-base ml-7 leading-relaxed">
                        Layanan instalasi CCTV profesional untuk Madiun dan sekitarnya.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <p className="text-sm font-bold text-slate-500 mb-3">Butuh Bantuan? Hubungi Kami:</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <a 
                      href={`https://wa.me/${waAdmin1.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="group flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-500/20 hover:bg-[#20bd5a] hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <MessageCircle size={18} className="transition-transform group-hover:scale-110" /> Admin 1
                    </a>
                    <a 
                      href={`https://wa.me/${waAdmin2.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="group flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-500/20 hover:bg-[#20bd5a] hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <MessageCircle size={18} className="transition-transform group-hover:scale-110" /> Admin 2
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 2: LOKASI MAPS */}
            <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:ring-blue-100">
              <div className="p-8 md:p-10 flex flex-col grow space-y-6">
                <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                  <MapPin className="text-blue-600" size={28} /> Lokasi Kami
                </h3>
                
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <MapPin size={18} />
                  </div>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Madiun, Jawa Timur</span>
                    {lokasiToko.content_value || "Alamat belum diatur."}
                  </p>
                </div>
                
                {/* BAGIAN MAP */}
                <div className="w-full bg-slate-100 rounded-2xl overflow-hidden grow min-h-[250px] border border-slate-200 ring-1 ring-slate-900/5 shadow-inner">
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

          {/* SECTION GALERI */}
          <section className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 text-center">
            <div className="mb-10 flex flex-col items-center">
              <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                Dokumentasi
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Galeri <span className="text-blue-600">Instalasi</span></h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto text-sm md:text-base">
                Bukti nyata komitmen kami dalam memberikan hasil pemasangan yang rapi, aman, dan memuaskan.
              </p>
            </div>
            
            <GallerySlider galeriData={galeriData} />
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}