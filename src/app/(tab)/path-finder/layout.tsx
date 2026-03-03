import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ค้นพบเส้นทางอาชีพ",
  description: "ทำแบบทดสอบ RIASEC เพื่อค้นหาอาชีพและค่ายที่เหมาะกับบุคลิกภาพและความสนใจของคุณ",
};

export default function PathFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
