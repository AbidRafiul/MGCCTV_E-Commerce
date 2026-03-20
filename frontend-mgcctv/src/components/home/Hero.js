import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center overflow-hidden">
      {/* BACKGROUND IMAGE - Full Screen & Mirrored */}
      <img
        src="/images/header.jpg"
        alt="MG CCTV Header"
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />

      {/* SOLID OVERLAY - Tanpa Gradasi (Pakai hitam transparan solid) */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 px-10 md:px-24 w-full">
        <div className="max-w-3xl">

          {/* HEADING - Solid White */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            Awasi Segalanya, <br /> 
            Dari Mana Saja.
          </h1>

          {/* DESKRIPSI */}
          <p className="mb-10 text-xl text-gray-200 max-w-xl leading-relaxed">
            Hadirkan keamanan mutakhir di genggaman Anda. Solusi CCTV cerdas dengan kualitas Ultra HD untuk melindungi rumah dan bisnis Anda 24/7.
          </p>

          {/* BUTTONS - Solid Colors */}
          <div className="flex flex-wrap gap-5">
            <Link
              href="/produk"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
            >
              Lihat Produk
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link
              href="/tentang"
              className="bg-green-600 hover:bg-gray-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all"
            >
              Informasi Toko
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}