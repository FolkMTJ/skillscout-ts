"use client";

import type { NavbarProps } from "@heroui/react";
import Image from "next/image";

import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Link,
    Button,
} from "@heroui/react";
import { cn } from "@heroui/react";

const menuItems = [
    "About",
    "Blog",
    "Customers",
    "Pricing",
    "Enterprise",
    "Changelog",
    "Documentation",
    "Contact Us",
];

export default function Component(props: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <Navbar
            {...props}
            isBordered
            classNames={{
                base: cn("border-default-100", {
                    "bg-default-200 dark:bg-default-100/50": isMenuOpen,
                }),
                wrapper: "w-full justify-center bg-transparent",
                item: "hidden md:flex",
            }}
            height="60px"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarMenuToggle className="text-default-400 md:hidden" />

            <NavbarBrand>
                <div className="text-background rounded-full flex items-center justify-center">
                    <Image
                        src="/skillscoutLogo-black.png"
                        alt="Skillscout Logo"
                        width={60}
                        height={52}
                        priority
                    />
                </div>
            </NavbarBrand>
            <NavbarContent
                className="border-small border-default-200/20 bg-background/60 shadow-medium dark:bg-default-100/50 hidden h-11 gap-8 rounded-full px-9 backdrop-blur-md backdrop-saturate-150 md:flex"
                justify="center"
            >
                <NavbarItem>
                    <Link className="text-default-500" href="\" size="sm">
                        หน้าหลัก
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link className="text-default-500" href="allcamps" size="sm">
                        ค่ายทั้งหมด
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link aria-current="page" color="foreground" href="#" size="sm">
                        Discovery Path
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link className="text-default-500" href="#" size="sm">
                        Path Finder
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem className="ml-2 flex! gap-2">
                    <Button
                        className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
                        radius="full"
                        variant="light"
                    >
                        เข้าสู่ระบบ
                    </Button>
                    <Button
                        className="border-small border-yellow-500/20 bg-yellow-500/10 text-yellow-800 hidden sm:flex"
                        color="primary"
                        radius="full"
                        style={{
                            boxShadow: "inset 0 0 4px #ffe70c70",
                        }}
                        variant="flat"
                    >
                        สมัครสมาชิก
                    </Button>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu
                className="bg-default-200/50 shadow-medium dark:bg-default-100/50 top-[calc(var(--navbar-height)-1px)] max-h-[70vh] pt-6 backdrop-blur-md backdrop-saturate-150"
                motionProps={{
                    initial: { opacity: 0, y: -20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 },
                    transition: {
                        ease: "easeInOut",
                        duration: 0.2,
                    },
                }}
            >
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <Link className="text-default-500 w-full" href="#" size="md">
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}
