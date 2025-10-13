import { Noto_Sans_Thai } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./provider";
import { NavBar } from "@/components";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSansTH.variable} antialiased` }
      >
        <Providers>
          <NavBar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}