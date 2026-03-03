"use client";

import { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
} from "@heroui/react";
import { FiInfo } from "react-icons/fi";

export default function GlobalDisclaimerModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [hideNextTime, setHideNextTime] = useState(false);

    useEffect(() => {
        // Check localStorage when component mounts
        const hideDisclaimer = localStorage.getItem("hideStudentDisclaimer");
        if (hideDisclaimer !== "true") {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        if (hideNextTime) {
            localStorage.setItem("hideStudentDisclaimer", "true");
        }
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} hideCloseButton isDismissable={false}>
            <ModalContent>
                <ModalHeader className="border-b border-gray-100 flex flex-col gap-1">
                    <span className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <FiInfo className="text-[#F2B33D]" />
                        ประกาศสำคัญจากผู้จัดทำ
                    </span>
                </ModalHeader>
                <ModalBody className="py-6 space-y-4 text-gray-700">
                    <p>
                        เว็บไซต์ <strong className="text-[#F2B33D]">SkillScout</strong> เป็นผลงานส่วนหนึ่งของ
                        <strong>โครงงานจุลนิพนธ์นักศึกษาระดับปริญญาตรี</strong> คณะเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยศิลปากร<br />
                        <span className="text-sm text-gray-500 mt-2 block border-l-3 border-[#F2B33D] pl-3 italic">
                            หัวข้อโครงงาน: "การออกแบบ และพัฒนาเว็บแอปพลิเคชันเพื่อสร้างพื้นที่เชื่อมโยงประสบการณ์ เกี่ยวกับเทคโนโลยี และส่งเสริมศักยภาพผ่านกิจกรรมเชิงปฏิบัติในกรุงเทพ"
                        </span>
                    </p>
                    <div className="bg-orange-50 p-4 rounded-xl text-sm border border-orange-100">
                        <p className="font-semibold text-orange-800 mb-2">วัตถุประสงค์ในการจัดทำ:</p>
                        <p className="text-orange-700 leading-relaxed mb-0">
                            เพื่อการศึกษาและวิจัยระบบสารสนเทศสำหรับการค้นหาและแนะนำค่ายพัฒนาทักษะ (SkillScout Platform) ไม่ได้จัดทำขึ้นเพื่อแสวงหาผลกำไรในเชิงธุรกิจแต่อย่างใด
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        ข้อมูลบางส่วนในเว็บไซต์นี้ถูกจำลองขึ้นเพื่อใช้ในการทดสอบระบบเท่านั้น ทางผู้จัดทำไม่มีเจตนาละเมิดลิขสิทธิ์หรือนำข้อมูลไปใช้ในทางที่ผิด หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติมสามารถติดต่อสอบถามได้ผ่านช่องทางติดต่อเรา
                    </p>

                    <div className="pt-4 border-t border-gray-100">
                        <Checkbox
                            isSelected={hideNextTime}
                            onValueChange={setHideNextTime}
                            size="sm"
                            color="warning"
                        >
                            รับทราบและไม่ต้องแสดงข้อความนี้อีก
                        </Checkbox>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={handleClose} className="w-full font-bold text-white bg-[#F2B33D] shadow-md shadow-orange-200">
                        เข้าสู่เว็บไซต์
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
