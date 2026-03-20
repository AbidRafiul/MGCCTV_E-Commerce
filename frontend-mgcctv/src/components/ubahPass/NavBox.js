"use client";

import { LogOut, Lock, Package, User } from "lucide-react";

const navItems = [
  {
    key: "profile",
    label: "Profile Saya",
    icon: User,
  },
  {
    key: "orders",
    label: "Pesanan Saya",
    icon: Package,
  },
  {
    key: "password",
    label: "Ubah Password",
    icon: Lock,
  },
  {
    key: "logout",
    label: "Logout",
    icon: LogOut,
  },
];

export default function NavBox({ activeItem = "profile", onNavigate }) {
  return (
    <aside className="w-full max-w-[210px] rounded-xl bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <nav className="space-y-1">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = key === activeItem;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate?.(key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
