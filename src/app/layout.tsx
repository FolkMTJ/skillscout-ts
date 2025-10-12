import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "@/styles/globals.css";

const notoSansTH = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansTH.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}