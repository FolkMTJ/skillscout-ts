'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface BookmarkContextType {
    bookmarkedCamps: string[];
    toggleBookmark: (campId: string) => Promise<boolean>;
    isLoading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType>({
    bookmarkedCamps: [],
    toggleBookmark: async () => false,
    isLoading: true,
});

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [bookmarkedCamps, setBookmarkedCamps] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchBookmarks();
        } else if (status === 'unauthenticated') {
            setBookmarkedCamps([]);
            setIsLoading(false);
        }
    }, [status]);

    const fetchBookmarks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/bookmarks');
            if (res.ok) {
                const data = await res.json();
                setBookmarkedCamps(data.bookmarks || []);
            }
        } catch (err) {
            console.error('Failed to fetch bookmarks', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBookmark = async (campId: string) => {
        if (!session?.user) return false;

        let finalState = false;
        try {
            // Optimistic update
            const wasBookmarked = bookmarkedCamps.includes(campId);
            finalState = !wasBookmarked;

            if (wasBookmarked) {
                setBookmarkedCamps(prev => prev.filter(id => id !== campId));
            } else {
                setBookmarkedCamps(prev => [...prev, campId]);
            }

            const res = await fetch('/api/user/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campId }),
            });
            const data = await res.json();

            // Sync actual state
            if (data.bookmarked !== undefined) {
                finalState = data.bookmarked;
                setBookmarkedCamps(prev => {
                    if (data.bookmarked) return prev.includes(campId) ? prev : [...prev, campId];
                    return prev.filter(id => id !== campId);
                });
                return data.bookmarked;
            }
            return finalState;
        } catch (err) {
            console.error('Failed to toggle bookmark', err);
            // Revert optimistic update by refetching
            fetchBookmarks();
            return !finalState;
        }
    };

    return (
        <BookmarkContext.Provider value={{ bookmarkedCamps, toggleBookmark, isLoading }}>
            {children}
        </BookmarkContext.Provider>
    );
}

export const useBookmarks = () => useContext(BookmarkContext);
