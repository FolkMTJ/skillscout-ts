"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@heroui/react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, FaEnvelope, FaPhone } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { FiActivity } from "react-icons/fi";

// offset เพื่อให้ตัวเลขเริ่มต้นสวยงาม
const VISITOR_OFFSET = 1000;

// สร้าง sessionId ใหม่ทุก tab/session (sessionStorage หายเมื่อปิด tab)
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'skillscout_sid';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function Footer() {
  return (
    <footer className="w-full relative overflow-hidden bg-[#2C2C2C]">
      <div className="relative">
        <FooterBody />
        <FooterBottom />
      </div>
    </footer>
  );
}

const FooterBody = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  const trackAndFetchVisitors = useCallback(async () => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    // เช็คว่า session นี้นับแล้วหรือยัง
    const counted = sessionStorage.getItem('skillscout_counted');
    if (counted) {
      // นับแล้ว → แค่ GET ยอดรวม
      try {
        const res = await fetch('/api/visitors');
        if (res.ok) {
          const data = await res.json() as { total: number };
          setVisitorCount(data.total + VISITOR_OFFSET);
        }
      } catch { /* silent */ }
      return;
    }

    // ยังไม่นับ → POST เพื่อ +1
    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json() as { total: number };
        setVisitorCount(data.total + VISITOR_OFFSET);
        sessionStorage.setItem('skillscout_counted', '1');
      }
    } catch {
      try {
        const res = await fetch('/api/visitors');
        if (res.ok) {
          const data = await res.json() as { total: number };
          setVisitorCount(data.total + VISITOR_OFFSET);
        }
      } catch { /* silent */ }
    }
  }, []);

  useEffect(() => {
    trackAndFetchVisitors();
  }, [trackAndFetchVisitors]);

  const quickLinks = [
    { label: 'หน้าแรก', href: "/" },
    { label: 'ค่ายทั้งหมด', href: "/allcamps" },
    { label: 'แบบทดสอบ', href: "/path-finder" },
    { label: 'Discovery Path', href: "/discovery" },
    { label: 'Path Finder', href: "/path-finder" },
  ];

  const supportLinks = [
    { label: 'เกี่ยวกับเรา', href: "/about" },
    { label: 'ติดต่อเรา', href: "/contact" },
    { label: 'คำถามที่พบบ่อย', href: "/faq" },
    { label: 'ช่วยเหลือ', href: "/help" },
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: "#", label: "Facebook", gradient: "from-blue-600 to-blue-500" },
    { icon: FaTwitter, href: "#", label: "Twitter", gradient: "from-sky-500 to-sky-400" },
    { icon: FaInstagram, href: "#", label: "Instagram", gradient: "from-pink-600 to-orange-500" },
    { icon: FaLinkedinIn, href: "#", label: "LinkedIn", gradient: "from-blue-700 to-blue-600" },
    { icon: FaGithub, href: "#", label: "GitHub", gradient: "from-gray-700 to-gray-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Column 1 - Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <div className="rounded-xl p-3 transition-all hover:scale-105">
              <Image
                width={100}
                height={40}
                src="/skillscoutLogo.png"
                alt="SkillScout"
              />
            </div>
          </Link>
          <p className="text-sm text-gray-300 dark:text-gray-400 leading-relaxed mb-6">
            แพลตฟอร์มค้นหาค่ายไอทีที่ใหญ่ที่สุด พัฒนาทักษะและสร้างอนาคตที่สดใสไปกับเรา
          </p>

          {/* Social Media */}
          <div className="flex gap-2">
            {socialLinks.map((social, idx) => (
              <Link
                key={idx}
                href={social.href}
                className="group relative"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}>
                  <social.icon size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
            เมนูหลัก
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 - Support */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
            ความช่วยเหลือ
          </h3>
          <ul className="space-y-3">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 - Contact & Status */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
            ติดต่อเรา
          </h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                <FaEnvelope size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">อีเมล</p>
                <p>contact@skillscout.com</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                <FaPhone size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">โทรศัพท์</p>
                <p>02-xxx-xxxx</p>
              </div>
            </li>
          </ul>

          {/* Live Visitor Count */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BsFillPeopleFill size={16} className="text-orange-400" />
                <span className="text-xs text-gray-400 font-medium">ผู้เข้าชมเว็บไซต์</span>
              </div>
              <FiActivity size={14} className="text-orange-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              {visitorCount === null ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-white">
                  {visitorCount.toLocaleString()}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-green-400 font-semibold">ออนไลน์</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 font-semibold">ระบบทำงานปกติ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FooterBottom = () => {
  return (
    <div className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            &copy; 2024 <span className="text-orange-400 font-semibold">SkillScout</span>. สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
              นโยบายคุกกี้
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
