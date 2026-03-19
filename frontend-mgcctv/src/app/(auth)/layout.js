// src/app/(auth)/layout.js

import Script from "next/script";

export default function AuthLayout({ children }) {
  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <main>
        {children}
      </main>
    </>
  );
}