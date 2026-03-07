import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer | SkillScout",
  description: "จัดการค่ายกิจกรรมของคุณ",
};

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
