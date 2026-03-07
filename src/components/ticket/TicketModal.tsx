"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from '@heroui/react';
import {
  FiDownload,
  FiMapPin,
  FiCalendar,
  FiMail,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiHash,
} from 'react-icons/fi';

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
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `eticket-${ticket.registrationId.slice(-8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isApproved = ticket.status === 'approved' || ticket.status === 'confirmed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      scrollBehavior="normal"
      backdrop="opaque"
      classNames={{
        base: "bg-white rounded-3xl shadow-2xl overflow-hidden",
        wrapper: "items-center",
        body: "p-0",
        closeButton: "z-50 text-gray-900 hover:bg-black/10 top-2 right-2",
      }}
    >
      <ModalContent>
        <ModalBody>
          {/* ── Header ── */}
          <div className="bg-[#F2B33D] px-6 pt-7 pb-5 text-center">
            <p className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-1">E-Ticket</p>
            <h2 className="text-gray-900 text-base font-black leading-tight line-clamp-2 px-2">
              {ticket.campName}
            </h2>
            <div className="mt-3">
              {isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 text-gray-900 text-[11px] font-bold">
                  <FiCheckCircle size={11} />
                  ยืนยันแล้ว
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 text-gray-900 text-[11px] font-bold">
                  <FiClock size={11} className="animate-pulse" />
                  รอการยืนยัน
                </span>
              )}
            </div>
          </div>

          {/* ── QR Code ── */}
          <div className="flex justify-center bg-white pt-4 pb-2">
            <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
              <Image
                src={ticket.qrCode}
                alt="Ticket QR Code"
                width={160}
                height={160}
                className="rounded-lg"
              />
            </div>
          </div>
          <p className="text-center text-[11px] text-gray-400 pb-3 bg-white">
            สแกน QR Code ที่จุดลงทะเบียน
          </p>

          {/* ── Info Rows ── */}
          <div className="px-5 bg-white">
            <InfoRow icon={<FiUser size={13} />} label="ชื่อ" value={ticket.userName} />
            <InfoRow icon={<FiMail size={13} />} label="อีเมล" value={ticket.userEmail} truncate />
            <InfoRow icon={<FiCalendar size={13} />} label="วันที่" value={ticket.campDate} />
            <InfoRow icon={<FiMapPin size={13} />} label="สถานที่" value={ticket.campLocation} />
            <InfoRow
              icon={<FiHash size={13} />}
              label="Ref ID"
              value={`#${ticket.registrationId.slice(-8).toUpperCase()}`}
              mono
              noBorder
            />
          </div>
        </ModalBody>

        {/* ── Footer ── */}
        <ModalFooter className="bg-white border-t border-gray-100 gap-2 px-5 py-3">
          <Button
            variant="bordered"
            size="sm"
            startContent={<FiDownload size={13} />}
            onPress={handleDownload}
            className="flex-1 border-gray-300 text-gray-700 font-semibold text-xs"
          >
            ดาวน์โหลด QR
          </Button>
          <Button
            size="sm"
            onPress={onClose}
            className="flex-1 bg-[#F2B33D] text-gray-900 font-bold shadow-md shadow-[#F2B33D]/30 text-xs"
          >
            ปิด
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function InfoRow({
  icon, label, value, truncate = false, mono = false, noBorder = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
  mono?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 py-2.5 ${!noBorder ? 'border-b border-gray-100' : ''}`}>
      <div className="w-6 h-6 rounded-md bg-[#F2B33D]/10 flex items-center justify-center text-[#F2B33D] shrink-0">
        {icon}
      </div>
      <span className="text-[11px] text-gray-500 w-14 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-gray-800 flex-1 text-right ${truncate ? 'truncate' : ''} ${mono ? 'font-mono text-[#F2B33D]' : ''}`}>
        {value}
      </span>
    </div>
  );
}
