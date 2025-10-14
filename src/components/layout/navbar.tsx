"use client";

import type { NavbarProps } from "@heroui/react";
import Image from "next/image";
import ToggleTheme from "./ToggleTheme";
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
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
} from "@heroui/react";
import { cn } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Settings, LayoutDashboard } from 'lucide-react';

const menuItems = [
    "About", "Blog", "Customers", "Pricing", "Enterprise",
    "Changelog", "Documentation", "Contact Us",
];

const navLinks = [
    { name: "หน้าหลัก", href: "/" },
    { name: "ค่ายทั้งหมด", href: "/allcamps" },
    { name: "Discovery Path", href: "/discovery-path" },
    { name: "Path Finder", href: "/path-finder" },
];

export default function Component(props: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <Navbar
            {...props}
            isBordered
            classNames={{
                base: cn("border-default-100", { "bg-default-200 dark:bg-default-100/50": isMenuOpen }),
                wrapper: "w-full justify-center bg-transparent",
                item: "hidden md:flex",
            }}
            height="60px"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarMenuToggle className="text-default-400 md:hidden" />

            <NavbarBrand>
                <Link href="/">
                    <div className="text-background rounded-full flex items-center justify-center">
                        {mounted && (
                            <Image
                                src={theme === 'dark' ? '/skillscoutLogo.png' : '/skillscoutLogo-black.png'}
                                alt="Skillscout Logo"
                                width={60}
                                height={52}
                                priority
                            />
                        )}
                    </div>
                </Link>
            </NavbarBrand>

            <NavbarContent
                className="border-small border-default-200/20 bg-background/60 shadow-medium dark:bg-default-100/50 hidden h-11 gap-8 rounded-full px-9 backdrop-blur-md backdrop-saturate-150 md:flex"
                justify="center"
            >
                {navLinks.map((link) => (
                    <NavbarItem key={link.href} isActive={pathname === link.href}>
                        <Link
                            color={pathname === link.href ? "foreground" : undefined}
                            className="text-default-500"
                            href={link.href}
                            size="sm"
                            aria-current={pathname === link.href ? "page" : undefined}
                        >
                            {link.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                {mounted && <ToggleTheme />}
                
                <NavbarItem className="ml-2 flex! gap-2">
                    {status === 'loading' ? (
                        <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
                    ) : session ? (
                        // Logged in
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    as="button"
                                    className="transition-transform hover:scale-110"
                                    color="primary"
                                    name={session.user?.name || 'User'}
                                    size="sm"
                                    src={session.user?.image || undefined}
                                    isBordered
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="User Actions" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                                    <p className="font-semibold">สวัสดี</p>
                                    <p className="font-semibold">{session.user?.name}</p>
                                    <p className="text-sm text-default-500">{session.user?.email}</p>
                                </DropdownItem>
                                <DropdownItem
                                    key="dashboard"
                                    startContent={<LayoutDashboard className="w-4 h-4" />}
                                    href={session.user?.role === 'organizer' ? '/organizer' : '/profile'}
                                >
                                    {session.user?.role === 'organizer' ? 'แดชบอร์ด' : 'โปรไฟล์'}
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    startContent={<Settings className="w-4 h-4" />}
                                    href="/settings"
                                >
                                    ตั้งค่า
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    startContent={<LogOut className="w-4 h-4" />}
                                    onClick={handleSignOut}
                                >
                                    ออกจากระบบ
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : (
                        // Not logged in
                        <>
                            <Button
                                as={Link}
                                href="/login"
                                className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
                                radius="full"
                                variant="light"
                            >
                                เข้าสู่ระบบ
                            </Button>
                            <Button
                                as={Link}
                                href="/register"
                                className="border-small border-yellow-500/20 bg-yellow-500/10 text-yellow-800 hidden sm:flex"
                                color="primary"
                                radius="full"
                                style={{ boxShadow: "inset 0 0 4px #ffe70c70" }}
                                variant="flat"
                            >
                                สมัครสมาชิก
                            </Button>
                        </>
                    )}
                </NavbarItem>
            </NavbarContent>

            <NavbarMenu
                className="bg-default-200/50 shadow-medium dark:bg-default-100/50 top-[calc(var(--navbar-height)-1px)] max-h-[70vh] pt-6 backdrop-blur-md backdrop-saturate-150"
                motionProps={{
                    initial: { opacity: 0, y: -20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 },
                    transition: { ease: "easeInOut", duration: 0.2 },
                }}
            >
                {navLinks.map((link) => (
                    <NavbarMenuItem key={link.href}>
                        <Link 
                            className="text-default-500 w-full" 
                            href={link.href} 
                            size="md"
                            color={pathname === link.href ? "primary" : "foreground"}
                        >
                            {link.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
                
                {session && (
                    <>
                        <NavbarMenuItem>
                            <Link
                                className="text-default-500 w-full"
                                href={session.user?.role === 'organizer' ? '/organizer' : '/profile'}
                                size="md"
                            >
                                {session.user?.role === 'organizer' ? 'แดชบอร์ด' : 'โปรไฟล์'}
                            </Link>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <button
                                className="text-danger w-full text-left"
                                onClick={handleSignOut}
                            >
                                ออกจากระบบ
                            </button>
                        </NavbarMenuItem>
                    </>
                )}
            </NavbarMenu>
        </Navbar>
    );
}
