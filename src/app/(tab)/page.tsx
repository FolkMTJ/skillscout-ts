import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: "หน้าแรก",
  description: "ค้นพบค่าย IT และกิจกรรมที่เหมาะกับคุณ - พัฒนาทักษะสู่อาชีพในฝันกับ SkillScout",
};

export default function Page() {
  return <HomePage />;
}
