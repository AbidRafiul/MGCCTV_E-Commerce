import "./globals.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

export const metadata = {
  title: "MGCCTV",
  description: "Admin Dashboard for MGCCTV",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${roboto.className} bg-slate-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}