import Link from "next/link";

export default function ProductHeader() {
  return (
    <div className="mx-auto mb-8 max-w-6xl px-4 pt-6 sm:mb-10 sm:px-6 sm:pt-10">
      <h1 className="mb-2 text-2xl font-extrabold text-[#0C2C55] sm:text-3xl">
        Katalog Produk
      </h1>
      <nav className="text-sm text-gray-500 font-medium">
        <Link href="/beranda" className="hover:text-blue-600">Beranda</Link>
        <span className="mx-2">/</span>
        <span className="text-[#0C2C55]">Produk</span>
      </nav>
    </div>
  );
}
