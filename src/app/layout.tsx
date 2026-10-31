import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ByteGuardian — Cybersecurity Maturity Assessment",
    template: "%s · ByteGuardian",
  },
  description:
    "AI-powered cybersecurity maturity assessment: evaluate your posture, find gaps and get recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
