// 1. Tambahkan import ini di bagian atas
import { Toaster } from "sonner"; 
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
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