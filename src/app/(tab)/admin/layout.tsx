import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | SkillScout",
  description: "ระบบจัดการแพลตฟอร์ม",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
