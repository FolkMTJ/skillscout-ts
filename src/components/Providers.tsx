// src/components/Providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        <Toaster position="top-center" />
        {children}
      </HeroUIProvider>
    </SessionProvider>
  );
}
