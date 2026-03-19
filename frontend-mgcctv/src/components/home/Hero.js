import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[500px] flex items-center justify-center">

      {/* Background */}
      <img
        src="/images/hero-cctv.jpg"
        alt="CCTV"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative text-center text-white px-6">
        <h1 className="text-4xl font-bold mb-4">
          Keamanan Rumah Anda Prioritas Kami
        </h1>

        <p className="mb-6 text-lg">
          Temukan berbagai pilihan CCTV berkualitas dengan harga terbaik
        </p>

        <Link
          href="/produk"
          className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded font-semibold"
        >
          Lihat Produk
        </Link>
      </div>

    </section>
  );
}