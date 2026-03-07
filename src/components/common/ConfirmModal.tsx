'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from '@heroui/react';
import { ReactNode } from 'react';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    /** ชื่อ action หรือหัวข้อ */
    title: string;
    /** ข้อความหลักที่แสดง */
    description?: string;
    /** content เพิ่มเติม (เช่น ชื่อรายการ, warning box) */
    children?: ReactNode;
    /** label ปุ่มยืนยัน */
    confirmLabel?: string;
    /** ปุ่มยืนยัน loading state */
    isLoading?: boolean;
    /** รูปแบบสี: danger=แดง, warning=ส้ม, info=เหลือง, success=เขียว */
    variant?: ConfirmModalVariant;
}

const VARIANT_CONFIG: Record<ConfirmModalVariant, {
    headerCls: string;
    confirmCls: string;
    iconPath: string;
}> = {
    danger: {
        headerCls: 'text-red-600',
        confirmCls: 'bg-red-500 hover:bg-red-600 shadow-red-200',
        iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
    warning: {
        headerCls: 'text-orange-500',
        confirmCls: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200',
        iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
    info: {
        headerCls: 'text-[#F2B33D]',
        confirmCls: 'bg-[#F2B33D] hover:bg-amber-400 shadow-amber-200',
        iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    success: {
        headerCls: 'text-emerald-600',
        confirmCls: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
        iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmLabel = 'ยืนยัน',
    isLoading = false,
    variant = 'danger',
}: ConfirmModalProps) {
    const cfg = VARIANT_CONFIG[variant];

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}
            placement="center"
            size="sm"
            classNames={{
                base: 'bg-white dark:bg-zinc-900 rounded-3xl shadow-xl',
                header: `border-b border-gray-100 dark:border-zinc-800 px-6 py-4 ${cfg.headerCls}`,
                body: 'px-6 py-5',
                footer: 'border-t border-gray-100 dark:border-zinc-800 px-6 py-4',
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d={cfg.iconPath} />
                        </svg>
                        <span className="text-base font-bold">{title}</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-3">
                        {description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                        )}
                        {children}
                    </div>
                </ModalBody>
                <ModalFooter className="flex gap-2">
                    <Button
                        variant="flat"
                        className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-medium rounded-xl"
                        onPress={onClose}
                        isDisabled={isLoading}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        className={`flex-[2] text-white font-bold rounded-xl shadow-sm ${cfg.confirmCls}`}
                        onPress={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
