import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import React from "react";
import NavBar from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | SkillScout",
  description: "เข้าสู่ระบบด้วย LINE หรืออีเมล OTP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <NavBar/>
        {children}
        <Footer/>
    </div>
  );
}