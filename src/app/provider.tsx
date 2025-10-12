"use client"

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>
            <NextThemeProvider 
            attribute="class" 
            defaultTheme="light"
            forcedTheme="light"
            themes={["light", "dark"
                
            ]}>
                {children}
            </NextThemeProvider>
        </HeroUIProvider>
    )
}