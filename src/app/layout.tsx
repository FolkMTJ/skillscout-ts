import { Noto_Sans_Thai } from "next/font/google";
import "@/styles/globals.css";
import { Providers as UIProviders } from "./provider";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "next-themes";
import type { Metadata, Viewport } from "next";
import GlobalDisclaimerModal from "@/components/GlobalDisclaimerModal";

const notoSansTH = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#F2B33D",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://skillscout.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    template: "%s | SkillScout",
    default: "SkillScout - ค้นหาค่ายพัฒนาทักษะและพอร์ตโฟลิโอ",
  },
  description: "SkillScout ค้นพบแคมป์ กิจกรรม และเส้นทางอาชีพที่ใช่สำหรับคุณ พัฒนาทักษะและสร้างพอร์ตโฟลิโอไปด้วยกัน",
  keywords: [
    "SkillScout", "ค่าย", "แคมป์", "ค่ายนักศึกษา", "ค่ายมัธยม",
    "ค้นหาตัวเอง", "พอร์ตโฟลิโอ", "TCAS", "กิจกรรมเด็กมัธยม", "ค่ายอาสา"
  ],
  authors: [{ name: "SkillScout Team" }],
  creator: "SkillScout",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://skillscout.com",
    title: "SkillScout - ค้นหาค่ายพัฒนาทักษะและพอร์ตโฟลิโอ",
    description: "แพลตฟอร์มค้นหาค่าย กิจกรรม และอีเวนต์สำหรับนักเรียนนักศึกษาที่ช่วยให้คุณค้นพบตัวเอง",
    siteName: "SkillScout",
    images: [
      {
        url: "/images/og-image.jpg", // Create a placeholder for now
        width: 1200,
        height: 630,
        alt: "SkillScout Cover",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillScout - ค้นหาค่ายพัฒนาทักษะ",
    description: "ค้นพบแคมป์ กิจกรรม และเส้นทางอาชีพที่ใช่สำหรับคุณ",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SkillScout",
  }
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
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            <UIProviders>
              <GlobalDisclaimerModal />
              {children}
            </UIProviders>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
