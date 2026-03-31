"use client";

import Link from "next/link";
import React from "react";
import CartList from "./CartList";

export default function CartHero() {
  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 px-5 py-2 sm:py-4">
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[#0C2C55] sm:text-3xl lg:text-4xl">
            Keranjang 
          </h2>
          <nav aria-label="Breadcrumb" className="mt-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <li>
                <Link href="/beranda" className="transition hover:text-slate-800">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/produk" className="transition hover:text-slate-800">
                  Produk
                </Link>
              </li>
              <li>/</li>
              <li className="font-medium text-slate-700">Keranjang</li>
            </ol>
          </nav>
        </div>

        <CartList />
      </div>
    </section>
  );
}
