"use client"; // ← Must be first line

import { Outfit } from "next/font/google";
import "./globals.css";
import AuthWrapper from "./components/AuthWrapper"; // client component

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
