'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@heroui/react';
import { FiRefreshCw, FiHome } from 'react-icons/fi';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    เกิดข้อผิดพลาดบางอย่าง!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    ระบบไม่สามารถทำงานตามที่คุณร้องขอได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือกลับไปที่หน้าแรก
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onPress={() => reset()}
                        className="bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-bold w-full"
                        startContent={<FiRefreshCw />}
                        size="lg"
                    >
                        ลองใหม่
                    </Button>
                    <Button
                        as={Link}
                        href="/"
                        variant="flat"
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold w-full"
                        startContent={<FiHome />}
                        size="lg"
                    >
                        กลับหน้าแรก
                    </Button>
                </div>
            </div>
        </div>
    );
}
