import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Admin Panel | Auto Craft",
  description: "Dashboard Admin Auto Craft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${display.variable} ${body.variable} bg-[#0A0A0B] font-[family-name:var(--font-body)] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
