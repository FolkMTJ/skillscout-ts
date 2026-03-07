// src/components/Providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';
import { BookmarkProvider } from '@/contexts/BookmarkContext';

import type { Session } from 'next-auth';

export function Providers({ children, session }: { children: React.ReactNode, session?: Session | null }) {
  return (
    <SessionProvider session={session}>
      <BookmarkProvider>
        <HeroUIProvider>
          <Toaster position="top-center" />
          {children}
        </HeroUIProvider>
      </BookmarkProvider>
    </SessionProvider>
  );
}
