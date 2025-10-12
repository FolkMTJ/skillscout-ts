"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import { useTheme } from "next-themes";

interface ToggleThemeProps {
  size?: "md" | "sm" | "lg";
  iconSize?: number;
  className?: string;
}

export default function ToggleTheme({ 
  size = "md", 
  iconSize = 22, 
  className = "" 
}: ToggleThemeProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // เมื่อ component mount แล้วค่อยแสดงผล เพื่อป้องกัน hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  // ก่อน mount แสดง skeleton ที่เหมือนกันทั้ง server และ client
  if (!mounted) {
    return (
      <Button
        radius="full"
        color="default"
        size={size}
        isIconOnly
        className={`bg-transparent ${className}`}
        disabled
      >
        <div style={{ width: iconSize, height: iconSize }} />
      </Button>
    );
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      radius="full"
      color="default"
      size={size}
      isIconOnly
      className={`bg-transparent ${className}`}
      onPress={handleThemeToggle}
    >
      {theme === "dark" ? (
        <BsFillMoonStarsFill size={iconSize} className="text-zinc-400" />
      ) : (
        <BsFillSunFill size={iconSize} className="text-zinc-400" />
      )}
    </Button>
  );
}