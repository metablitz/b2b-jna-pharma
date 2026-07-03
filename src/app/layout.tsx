import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreHydration from "@/components/StoreHydration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JNA Pharma - Nền tảng B2B phân phối dược phẩm",
  description: "Đặt hàng dược phẩm sỉ dành riêng cho nhà thuốc - Công ty TNHH Dược Jet Ngọc Ánh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
