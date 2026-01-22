import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "@/components/NavBar";
import { AuthProvider } from "@/hooks/useAuth";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DineMapper",
  description: "Dine Mapper is a simple app to track your favorite restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
        defer 
        src="https://umami-s0oc4skk08wwkowg8gokc088.faiscs.com/script.js" 
        data-website-id="0d1b988b-b000-408e-a797-0348b4a22351"/>
        <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""/>
      </head>
      <body className={`${inter.className} bg-slate-50`}>
        <AuthProvider>
          <Navbar/>
              {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}