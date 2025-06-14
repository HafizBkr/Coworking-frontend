/* eslint-disable react/react-in-jsx-scope */
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito_sans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"]
});


export const metadata: Metadata = {
  title: "Working",
  description: "Platforme de co-working"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${nunito_sans.className} antialiased h-full`}
      >
        {children}
      </body>
    </html>
  );
}
