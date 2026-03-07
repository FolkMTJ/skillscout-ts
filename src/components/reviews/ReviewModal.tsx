// src/components/reviews/ReviewModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from '@heroui/react';
import { FaStar } from 'react-icons/fa';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campId: string;
  campName: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  campId,
  campName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('กรุณาให้คะแนน');
      return;
    }

    if (comment.trim().length < 10) {
      setError('กรุณาเขียนความคิดเห็นอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // รีเซ็ตฟอร์ม
      setRating(0);
      setComment('');
      
      // แจ้งความสำเร็จ
      onSuccess();
      onClose();
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งรีวิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white dark:bg-gray-800',
        header: 'border-b border-gray-200 dark:border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-200 dark:border-gray-700',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            เขียนรีวิว
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
            {campName}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ให้คะแนน <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <FaStar
                      size={40}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  คุณให้ {rating} ดาว
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ความคิดเห็น <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="แชร์ประสบการณ์ของคุณในค่ายนี้... (อย่างน้อย 10 ตัวอักษร)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minRows={4}
                maxRows={8}
                disabled={isSubmitting}
                classNames={{
                  input: 'text-gray-900 dark:text-white',
                  inputWrapper: 'border-gray-300 dark:border-gray-600',
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {comment.length}/1000 ตัวอักษร
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={handleClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          >
            {isSubmitting ? 'กำลังส่งรีวิว...' : 'ส่งรีวิว'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
