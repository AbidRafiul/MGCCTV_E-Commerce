"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f5f6f8] text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  return children;
}
