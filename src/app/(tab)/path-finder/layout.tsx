import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Path Finder | SkillScout",
  description: "ทำแบบทดสอบ RIASEC เพื่อค้นหาอาชีพที่เหมาะกับบุคลิกภาพของคุณ",
};

export default function PathFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
