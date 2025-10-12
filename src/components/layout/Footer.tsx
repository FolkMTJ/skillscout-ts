"use client";

import React from "react";
import Image from "next/image";
import { Chip, Divider, Link, Spacer } from "@heroui/react";
import { BsFillPeopleFill } from "react-icons/bs";


export default function Footer() {

  return (
    <footer className="w-full flex flex-col items-center justify-center bg-white dark:bg-black">
      <FooterBorder />
      <FooterBody />
      <div className="w-full flex justify-center items-center py-1.5 bg-black border-t-small border-default-200/70 rounded-t-2xl">
        <span className="text-xs font-medium flex leading-none text-zinc-200">
          &copy; 2024 SkillScout. {'footerEnd'}
        </span>
        {/* <span className="text-xs font-medium flex leading-none text-zinc-200">
          &copy; 2024 Bangkrajao. สงวนลิขสิทธิ์ทั้งหมด | เพื่อการศึกษาเท่านั้น
        </span> */}
      </div>
    </footer>
  );
}

const FooterBody = () => {

  // ใช้ข้อมูลเมนูเดียวกันกับ Navbar
  const menuItems = [
    {
      label: 'history',
      href: "/history"
    },
    {
      label: 'place',
      href: "/place"
    },
    {
      label: 'news',
      href: "/blog"
    },
    {
      label: 'community',
      href: "/community"
    },
    {
      label: 'static',
      href: "/information"
    },
  ];

  return (
    <div className="mx-auto max-w-[1536px] px-6 pt-10 pb-6" >
      <div className="flex items-center justify-center">
        <Link href="/">
          <Image
            width={95}
            height={40}
            src="/skillscoutLogo-black.png"
            alt="skillscoutLogo"
          />
        </Link>
      </div>
      <Spacer y={4} />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            className="text-zinc-800 dark:text-zinc-300 font-[family-name:var(--font-line-seed-sans)] text-md"
            href={item.href}
            size="sm"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Spacer y={4} />
      <div className="flex justify-center gap-x-4 items-center">
        <div className="bg-transparent p-0 max-w-[150px]">
          <div className="flex items-center gap-2">
            <BsFillPeopleFill size={18} className="text-primary-color" />
          </div>
        </div>
        <Divider className="h-4" orientation="vertical" />
        <Chip
          className="border-none p-0 text-default-500"
          color="success"
          variant="dot"
          classNames={{
            dot: "relative before:content-[''] before:absolute before:-inset-[2px] before:rounded-full before:bg-success-500 before:animate-ping before:opacity-75"
          }}
        >
          {'footerSystem'}
        </Chip>
      </div>
    </div>
  )
}

const FooterBorder = () => {
  return (
    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary-color to-transparent"></div>
  )
}