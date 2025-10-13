"use client";

import React from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import type { CampData } from "@/lib/db";
import {
  FaUser, FaPhone, FaEnvelope, FaMapPin, FaCalendar, FaMapMarkerAlt
} from "react-icons/fa";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: CampData;
}

const mockUser = {
    fullName: "Name example",
    phone: "081-234-5678",
    email: "example@gmail.com",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110",
};

export default function BookingModal({ isOpen, onClose, camp }: BookingModalProps) {
  const paymentFee = 25;
  const campPrice = parseFloat(camp.price.replace(/[^0-9.-]+/g, ""));
  const totalPrice = campPrice + paymentFee;

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">
              ยืนยันการสมัคร
            </ModalHeader>

            <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-6 bg-gray-50/50 dark:bg-gray-900/50">
              
              {/* Left Column: Booker Info & Payment */}
              <div className="space-y-8">
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ข้อมูลผู้จอง</h3>
                  <div className="space-y-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 p-4 border dark:border-gray-700">
                      <div className="flex items-center gap-3 text-sm">
                          <FaUser className="text-gray-400 w-4 text-center" />
                          <span className="text-gray-700 dark:text-gray-300">{mockUser.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <FaPhone className="text-gray-400 w-4 text-center" />
                          <span className="text-gray-700 dark:text-gray-300">{mockUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <FaEnvelope className="text-gray-400 w-4 text-center" />
                          <span className="text-gray-700 dark:text-gray-300">{mockUser.email}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                          <FaMapPin className="text-gray-400 w-4 text-center mt-1" />
                          <span className="text-gray-700 dark:text-gray-300">{mockUser.address}</span>
                      </div>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800 dark:text-white">
                     การชำระเงิน
                  </h3>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4">
                    <p className="font-semibold text-center">สแกนเพื่อชำระเงินผ่านแอปธนาคาร</p>
                    <div className="p-2 bg-white rounded-lg">
                      <Image src="/promptpay-qr.jpg" alt="QR Code PromptPay" width={307} height={300} />
                    </div>
                    <p className="text-xs text-gray-500">Thai QR Payment</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-inner-lg border border-gray-200 dark:border-gray-700 space-y-4 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">สรุปข้อมูลการจอง</h3>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                          src={camp.image}
                          alt={camp.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="50vw"
                      />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                      <p className="font-bold text-base">{camp.name}</p>
                      <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                          <p className="flex items-center gap-2"><FaCalendar className="text-gray-400" /> {camp.date}</p>
                          <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> {camp.location}</p>
                      </div>
                  </div>

                  <hr className="dark:border-gray-700" />

                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>ค่าสมัคร</span><span>{camp.price}</span></div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>ค่าธรรมเนียม</span><span>฿{paymentFee.toFixed(2)}</span></div>
                      <div className="flex justify-between font-bold text-lg border-t border-dashed pt-3 mt-3 dark:border-gray-700"><span>ยอดรวม</span><span>฿{totalPrice.toFixed(2)}</span></div>
                  </div>

                  <div className="flex-grow"></div>

                  <div className="space-y-4">
                      <div className="flex gap-2">
                          <Input placeholder="รหัสโปรโมชัน" size="sm" variant="bordered" />
                          <Button size="sm" variant="ghost">ใช้รหัส</Button>
                      </div>
                      <div className="h-20 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
                          <p className="text-sm text-gray-500">( พื้นที่สำหรับ CAPTCHA )</p>
                      </div>
                  </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
              <Button variant="light" onPress={onClose} size="lg">
                ยกเลิก
              </Button>
              <Button className="bg-[#F2B33D] font-bold text-white" color="warning" variant="shadow" size="lg" onPress={onClose}>
                ยืนยันชำระเงิน
              </Button>
            </ModalFooter>
          </>
      </ModalContent>
    </Modal>
  );
}