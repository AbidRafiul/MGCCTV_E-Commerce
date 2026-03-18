"use client";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white px-10 py-8 mt-10">
      
      <div className="grid grid-cols-3 gap-6">

        <div>
          <h3 className="font-bold mb-2">MG CCTV</h3>
          <p className="text-sm">
            Solusi CCTV terbaik untuk keamanan Anda.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Menu Cepat</h3>
          <ul className="text-sm space-y-1">
            <li>Beranda</li>
            <li>Produk</li>
            <li>Tentang Kami</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-2">Contact</h3>
          <p className="text-sm">0812-3456-7890</p>
          <p className="text-sm">mgcctv@gmail.com</p>
        </div>

      </div>

    </footer>
  );
}