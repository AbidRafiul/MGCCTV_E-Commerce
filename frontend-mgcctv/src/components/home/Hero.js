import Link from "next/link";

export default function Hero({ data }) {
  const bgImage = data?.url_gambar || "/images/header.jpg";
  const descText = data?.content_value || "Hadirkan keamanan mutakhir di genggaman Anda. Solusi CCTV cerdas dengan kualitas Ultra HD untuk melindungi rumah dan bisnis Anda 24/7.";

  return (
    // Mobile: min-h-[75vh], Desktop: h-[100svh]
    <section className="relative w-full min-h-[75vh] md:min-h-[100svh] flex items-center overflow-hidden">
      <img
        src={bgImage}
        alt="MG CCTV Header"
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] object-center"
      />

      <div className="absolute inset-0 bg-black/60 md:bg-black/50"></div>

      {/* Padding mobile dikurangi agar tidak memakan layar */}
      <div className="relative z-10 px-5 md:px-24 w-full pt-20 md:pt-0">
        <div className="max-w-3xl">

          {/* Judul: Mobile text-3xl, Desktop text-7xl */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-8 leading-[1.2] md:leading-tight tracking-tight">
            Awasi Segalanya, <br /> 
            Dari Mana Saja.
          </h1>

          {/* Deskripsi: Mobile text-sm, Desktop text-xl */}
          <p className="mb-8 md:mb-10 text-sm md:text-xl text-gray-200 max-w-xl leading-relaxed">
            {descText}
          </p>

          {/* Tombol: Dikecilkan di HP agar muat bersebelahan atau rapi bersusun */}
          <div className="flex flex-wrap gap-3 md:gap-5">
            <Link
              href="/produk"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 md:px-10 md:py-5 rounded-lg md:rounded-xl font-bold text-sm md:text-lg transition-all flex items-center gap-2"
            >
              Lihat Produk
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link
              href="/tentang"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 md:px-10 md:py-5 rounded-lg md:rounded-xl font-bold text-sm md:text-lg transition-all"
            >
              Informasi Toko
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}