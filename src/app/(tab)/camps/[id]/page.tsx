// 🔷 Файлนี้เป็น Server Component (ไม่ต้องมี "use client")
// ทำหน้าที่เป็น "พนักงานเสิร์ฟ" ที่จัดการข้อมูล

import { notFound } from "next/navigation";
import { getCampById } from "@/lib/data"; // 1. อิมพอร์ตฟังก์ชันสำหรับสั่งอาหารจาก "เชฟ"
import CampDetailView from "./CampDetailView"; // 2. อิมพอร์ต "โต๊ะอาหาร" ที่จะนำข้อมูลไปแสดงผล

/**
 * Page นี้ต้องเป็น async function เพื่อ "รอ" ให้เชฟทำอาหารเสร็จ (รอข้อมูลจาก database)
 */
export default async function CampDetailPage({ params }: { params: { id: string } }) {
  
  // 3. รับออเดอร์ (params.id) แล้วไปสั่งอาหารกับเชฟ (getCampById)
  //    ใช้ await เพื่อรอจนกว่าจะได้ข้อมูลกลับมา
  const camp = await getCampById(params.id);

  // 4. หากเชฟบอกว่าไม่มีเมนูนี้ (ไม่พบข้อมูล) ให้แจ้งลูกค้า (แสดงหน้า 404)
  if (!camp) {
    notFound();
  }

  // 5. เมื่อได้อาหารมาแล้ว (ได้ข้อมูล camp)
  //    ให้นำไปเสิร์ฟที่โต๊ะ (ส่งเป็น prop `camp` ไปให้ CampDetailView)
  return <CampDetailView camp={camp} />;
}