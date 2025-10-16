import { Noto_Sans_Thai } from "next/font/google";
import "@/styles/globals.css";
import { Providers as UIProviders } from "./provider";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";

const notoSansTH = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillScout",
  description: "A platform to discover the best camps for your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansTH.variable} antialiased`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UIProviders>
              {children}
            </UIProviders>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
