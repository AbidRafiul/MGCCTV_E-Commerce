"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLogin(true);
  }, []);

  return (
    <nav className="bg-white text-[#0C2C55] shadow px-10 py-4 flex justify-between items-center">

      {/* LOGO */}
      <h1 className="font-bold text-xl text-blue-700">
        MGCCTV
      </h1>

      {/* MENU */}
      <div className="flex gap-6 items-center">

        <Link href="/">Beranda</Link>
        <Link href="/produk">Produk</Link>
        <Link href="/tentang">Tentang Kami</Link>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* CART */}
        <span className="text-xl cursor-pointer">🛒</span>

        {/* AUTH */}
        {isLogin ? (
          <Link href="/profile" className="font-semibold text-blue-600">
            Profile
          </Link>
        ) : (
          <Link href="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}