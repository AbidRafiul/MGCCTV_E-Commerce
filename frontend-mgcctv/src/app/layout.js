import { Toaster } from "sonner"; 
import { Poppins } from "next/font/google"; // 1. Import font dari Google
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* 3. Masukkan class font ke dalam tag body */}
      <body className={poppins.className}> 
        {children}
        
        <Toaster 
          position="top-right" 
          offset="80px"
          richColors 
          theme="light" 
          style={{ zIndex: 99999 }} 
        />
      </body>
    </html>
  );
}