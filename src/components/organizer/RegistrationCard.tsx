// src/components/organizer/RegistrationCard.tsx
'use client';

import { Button } from '@heroui/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Registration } from '@/types/camp';

interface RegistrationCardProps {
  registration: Registration;
  campName?: string;
  onApprove: () => void;
  onReject: () => void;
}

export default function RegistrationCard({ 
  registration, 
  campName, 
  onApprove, 
  onReject 
}: RegistrationCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
      <div className="mb-3">
        <p className="font-semibold text-gray-800">{registration.userName}</p>
        <p className="text-sm text-gray-600">{registration.userEmail}</p>
        {campName && (
          <p className="text-sm text-gray-500 mt-1">📚 {campName}</p>
        )}
        {registration.userPhone && (
          <p className="text-sm text-gray-500">📱 {registration.userPhone}</p>
        )}
      </div>

      {registration.answers && registration.answers.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-600 mb-2">คำตอบจากผู้สมัคร:</p>
          {registration.answers.map((answer, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <p className="text-xs text-gray-500">{answer.question}</p>
              <p className="text-sm text-gray-700">{answer.answer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          color="success"
          startContent={<CheckCircle className="w-4 h-4" />}
          onPress={onApprove}
          className="flex-1"
        >
          อนุมัติ
        </Button>
        <Button
          size="sm"
          color="danger"
          startContent={<XCircle className="w-4 h-4" />}
          onPress={onReject}
          className="flex-1"
        >
          ปฏิเสธ
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        สมัครเมื่อ: {new Date(registration.appliedAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  );
}
