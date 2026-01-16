import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Camps | SkillScout",
  description: "จัดการค่ายที่คุณสมัครและเข้าร่วม",
};

export default function MyCampsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
