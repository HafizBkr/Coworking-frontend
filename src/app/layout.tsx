/* eslint-disable react/react-in-jsx-scope */
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

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
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <body
        className={`${nunito_sans.className} antialiased h-full`}
      >
      <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors expand closeButton/>
        </ThemeProvider>
      </body>
    </html>
  );
}
