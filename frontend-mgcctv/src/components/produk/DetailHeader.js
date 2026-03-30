import Link from "next/link";

export default function DetailHeader({ productName }) {
  return (
    <div className="mb-10 pt-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#0C2C55] mb-2">Detail Produk</h1>
      <nav className="text-sm text-gray-500 font-medium">
        <Link href="/beranda" className="hover:text-blue-600">Beranda</Link>
        <span className="mx-2">/</span>
        <Link href="/produk" className="hover:text-blue-600">Produk</Link>
        <span className="mx-2">/</span>
        <span className="text-[#0C2C55] truncate">{productName || "Loading..."}</span>
      </nav>
    </div>
  );
}