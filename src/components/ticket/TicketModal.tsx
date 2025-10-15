"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Divider,
} from '@heroui/react';
import { FaQrcode, FaDownload, FaCheckCircle, FaClock } from 'react-icons/fa';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    registrationId: string;
    userName: string;
    userEmail: string;
    campName: string;
    campDate: string;
    campLocation: string;
    qrCode: string;
    status: string;
    createdAt: string;
  };
}

export default function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
  
  const handleDownload = () => {
    // Create a download link for the ticket
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `ticket-${ticket.registrationId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'approved':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-500">
            <FaCheckCircle className="text-green-600" />
            <span className="font-bold text-green-700 dark:text-green-400">ยืนยันแล้ว</span>
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500">
            <FaClock className="text-yellow-600 animate-pulse" />
            <span className="font-bold text-yellow-700 dark:text-yellow-400">รอการยืนยัน</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800",
        header: "border-b-2 border-orange-300 dark:border-gray-700",
        body: "py-6",
        footer: "border-t-2 border-orange-300 dark:border-gray-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <FaQrcode className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Ticket เข้าค่าย
              </h2>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {ticket.campName}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="text-center">
              {getStatusBadge()}
            </div>

            {/* Ticket Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-orange-300 dark:border-orange-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <h3 className="text-2xl font-black mb-2">🎫 E-Ticket</h3>
                <p className="text-sm opacity-90">Registration ID: {ticket.registrationId.slice(-8)}</p>
              </div>

              {/* QR Code */}
              <div className="p-8 text-center bg-white dark:bg-gray-900">
                <div className="inline-block p-6 bg-white rounded-2xl shadow-xl">
                  <Image
                    src={ticket.qrCode}
                    alt="Ticket QR Code"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  แสดง QR Code นี้ที่จุดลงทะเบียน
                </p>
              </div>

              <Divider />

              {/* Details */}
              <div className="p-6 space-y-3 bg-gradient-to-b from-orange-50/50 to-amber-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ชื่อผู้เข้าร่วม</span>
                  <span className="font-bold text-gray-900 dark:text-white">{ticket.userName}</span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">อีเมล</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{ticket.userEmail}</span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">วันที่จัด</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{ticket.campDate}</span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">สถานที่</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{ticket.campLocation}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">📋 วิธีใช้งาน:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>นำ QR Code นี้ไปแสดงที่จุดลงทะเบียน</li>
                <li>เจ้าหน้าที่จะสแกน QR เพื่อยืนยันการเข้าร่วม</li>
                <li>สามารถบันทึกหน้าจอหรือดาวน์โหลดได้</li>
                <li>ห้ามแชร์ QR Code ให้ผู้อื่น</li>
              </ul>
            </div>

            {/* Warning */}
            {ticket.status === 'pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-300 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>หมายเหตุ:</strong> การสมัครของคุณยังรอการยืนยัน กรุณารอจนกว่าจะได้รับการอนุมัติก่อนเข้าร่วมค่าย
                </p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="warning"
            variant="flat"
            onPress={handleDownload}
            startContent={<FaDownload />}
          >
            ดาวน์โหลด Ticket
          </Button>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold"
            onPress={onClose}
          >
            ปิด
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
