"use client";

import type { NavbarProps } from "@heroui/react";
import Image from "next/image";
// import ToggleTheme from "./ToggleTheme";
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
import { LogOut, Settings, LayoutDashboard, Calendar, Shield } from 'lucide-react';
import ProfileModal from '@/components/profile/ProfileModal';
import { User } from '@/types';

const navLinks = [
    { name: "หน้าหลัก", href: "/" },
    { name: "ค่ายทั้งหมด", href: "/allcamps" },
    { name: "Discovery Path", href: "/discovery" },
    { name: "Path Finder", href: "/path-finder" },
];

export default function NavBar(props: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [mounted, setMounted] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    const { theme } = useTheme();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch user data when session is available
    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                try {
                    const response = await fetch(`/api/user/profile`);
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data.user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        if (session) {
            fetchUserData();
        }
    }, [session]);

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    const handleOpenProfileModal = () => {
        setIsProfileModalOpen(true);
    };

    const handleProfileUpdate = async () => {
        // Refetch user data after update
        if (session?.user?.email) {
            try {
                const response = await fetch(`/api/user/profile`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);
                }
            } catch (error) {
                console.error('Error refetching user data:', error);
            }
        }
    };

    return (
        <>
            <Navbar
                {...props}
                classNames={{
                    base: cn("bg-[#2C2C2C]", { "bg-[#2C2C2C]": isMenuOpen }),
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
                                    src={theme === 'dark' ? '/skillscoutLogo.png' : '/skillscoutLogo.png'}
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
                    className="hidden h-11 gap-8 md:flex"
                    justify="center"
                >
                    {navLinks.map((link) => (
                        <NavbarItem key={link.href} isActive={pathname === link.href}>
                            <Link
                                color={pathname === link.href ? "warning" : undefined}
                                className={pathname === link.href ? "text-[#F2B33D] font-semibold" : "text-white/80 hover:text-white"}
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
                    {/* {mounted && <ToggleTheme />} */}

                    <NavbarItem className="ml-2 flex! gap-2">
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
                        ) : session ? (
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Avatar
                                        as="button"
                                        className="transition-transform hover:scale-110"
                                        color="warning"
                                        name={session.user?.name || 'User'}
                                        size="sm"
                                        src={userData?.profileImage || session.user?.image || undefined}
                                        isBordered
                                        classNames={{
                                            base: "ring-[#F2B33D] ring-2"
                                        }}
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
                                        href={
                                            session.user?.role === 'admin' ? '/admin' :
                                                session.user?.role === 'organizer' ? '/organizer' : '/profile'
                                        }
                                    >
                                        {
                                            session.user?.role === 'admin' ? 'Admin Dashboard' :
                                                session.user?.role === 'organizer' ? 'แดชบอร์ด' : 'โปรไฟล์'
                                        }
                                    </DropdownItem>
                                    {session.user?.role === 'admin' ? (
                                        <DropdownItem
                                            key="organizer-dashboard"
                                            startContent={<Shield className="w-4 h-4" />}
                                            href="/organizer"
                                        >
                                            Organizer Dashboard
                                        </DropdownItem>
                                    ) : null}
                                    {(session.user?.role === 'user' || session.user?.role === 'admin') ? (
                                        <DropdownItem
                                            key="my-camps"
                                            startContent={<Calendar className="w-4 h-4" />}
                                            href="/my-camps"
                                        >
                                            ค่ายของฉัน
                                        </DropdownItem>
                                    ) : null}
                                    <DropdownItem
                                        key="settings"
                                        startContent={<Settings className="w-4 h-4" />}
                                        onPress={handleOpenProfileModal}
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
                            <>
                                <Button
                                    as={Link}
                                    href="/login"
                                    className="text-white/90 hover:text-white font-medium hover:bg-white/10"
                                    radius="full"
                                    variant="light"
                                >
                                    เข้าสู่ระบบ
                                </Button>
                                <Button
                                    as={Link}
                                    href="/register"
                                    className="bg-[#F2B33D] text-[#2C2C2C] font-bold shadow-lg hover:shadow-xl hover:bg-[#ffc145] transition-all transform hover:-translate-y-0.5 border border-[#F2B33D]/50 hidden sm:flex"
                                    radius="full"
                                    variant="solid"
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

                    {session ? (
                        <>
                            <NavbarMenuItem key="dashboard-menu">
                                <Link
                                    className="text-default-500 w-full"
                                    href={
                                        session.user?.role === 'admin' ? '/admin' :
                                            session.user?.role === 'organizer' ? '/organizer' : '/profile'
                                    }
                                    size="md"
                                >
                                    {
                                        session.user?.role === 'admin' ? 'Admin Dashboard' :
                                            session.user?.role === 'organizer' ? 'แดชบอร์ด' : 'โปรไฟล์'
                                    }
                                </Link>
                            </NavbarMenuItem>
                            {session.user?.role === 'admin' ? (
                                <NavbarMenuItem key="organizer-menu">
                                    <Link
                                        className="text-default-500 w-full"
                                        href="/organizer"
                                        size="md"
                                    >
                                        Organizer Dashboard
                                    </Link>
                                </NavbarMenuItem>
                            ) : null}
                            {(session.user?.role === 'user' || session.user?.role === 'admin') ? (
                                <NavbarMenuItem key="my-camps-menu">
                                    <Link
                                        className="text-default-500 w-full"
                                        href="/my-camps"
                                        size="md"
                                        color={pathname === '/my-camps' ? "primary" : "foreground"}
                                    >
                                        ค่ายของฉัน
                                    </Link>
                                </NavbarMenuItem>
                            ) : null}
                            <NavbarMenuItem key="settings-menu">
                                <button
                                    className="text-default-500 w-full text-left"
                                    onClick={handleOpenProfileModal}
                                >
                                    ตั้งค่า
                                </button>
                            </NavbarMenuItem>
                            <NavbarMenuItem key="logout-menu">
                                <button
                                    className="text-danger w-full text-left"
                                    onClick={handleSignOut}
                                >
                                    ออกจากระบบ
                                </button>
                            </NavbarMenuItem>
                        </>
                    ) : null}
                </NavbarMenu>
            </Navbar >

            {/* Profile Modal */}
            {
                userData && (
                    <ProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        user={userData}
                        onUpdate={handleProfileUpdate}
                    />
                )
            }
        </>
    );
}
