import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery Path | SkillScout",
  description: "วิเคราะห์เส้นทางอาชีพจากค่ายที่คุณเข้าร่วม",
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
