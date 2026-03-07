import Footer from "@/components/layout/Footer";
import React from "react";
import NavBar from "@/components/layout/Nav";

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