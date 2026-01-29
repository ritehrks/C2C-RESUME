import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const merriweather = Merriweather({ weight: ['300', '400', '700'], subsets: ["latin"], variable: "--font-merriweather", display: 'swap' });

export const metadata: Metadata = {
  title: "C2C Resume Platform",
  description: "Official LaTeX-based resume builder for MNIT Jaipur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-display antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
