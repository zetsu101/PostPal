import "./globals.css";
import { Inter, Lato } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" });

export const metadata: Metadata = {
  title: "PostPal | Social Media Content Assistant",
  description: "AI-powered post ideas, captions, hashtags, and calendar for creators and brands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lato.variable} bg-[#F9FAFB] text-[#1F2937]`}>
      <body className="min-h-screen font-sans bg-[#F9FAFB] text-[#1F2937]">{children}</body>
    </html>
  );
}
