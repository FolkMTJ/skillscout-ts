// src/lib/data.ts

import { allCamps, categories } from "./db";
import type { CampData, CategoryData } from "./db";

// ฟังก์ชันสำหรับดึงข้อมูล Camps ทั้งหมด
export async function getCamps(): Promise<CampData[]> {
  return allCamps;
}

// ฟังก์ชันสำหรับดึงข้อมูล Camp ตาม ID
export async function getCampById(id: string): Promise<CampData | undefined> {
  return allCamps.find((camp) => camp.id === id);
}

// ฟังก์ชันสำหรับดึงข้อมูล Categories ทั้งหมด
export async function getCategories(): Promise<CategoryData[]> {
  return categories;
}

// ฟังก์ชันจำลองการดึงข้อมูล "ด่วน" (เช่น 5 ค่ายที่ใกล้หมดเขตที่สุด)
export async function getUrgentCamps(limit: number = 5): Promise<CampData[]> {
  const sorted = [...allCamps].sort((a, b) => a.daysLeft - b.daysLeft);
  return sorted.slice(0, limit);
}

// ฟังก์ชันจำลองการดึงข้อมูล "Trending"
export async function getTrendingCamps(): Promise<CampData[]> {
  return allCamps.filter((camp) => camp.isTrending);
}