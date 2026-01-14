// src/components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Button, Textarea } from '@heroui/react';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  campId: string;
  campName: string;
  onReviewSubmitted: () => void;
  userName: string;
}

export default function ReviewForm({ campId, onReviewSubmitted, userName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('กรุณาให้คะแนน');
      return;
    }

    if (!comment.trim()) {
      toast.error('กรุณาเขียนความคิดเห็น');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/camps/${campId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: userName,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('เขียนรีวิวสำเร็จ!');
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('เกิดข้อผิดพลาดในการเขียนรีวิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        แบ่งปันประสบการณ์ของคุณ
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ให้คะแนนค่าย
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                size={32}
                className={
                  star <= (hover || rating)
                    ? 'text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {rating === 1 && 'แย่มาก'}
            {rating === 2 && 'ไม่ค่อยดี'}
            {rating === 3 && 'ปานกลาง'}
            {rating === 4 && 'ดี'}
            {rating === 5 && 'ดีมาก'}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ความคิดเห็น
        </label>
        <Textarea
          placeholder="แบ่งปันประสบการณ์ของคุณในค่ายนี้..."
          value={comment}
          onValueChange={setComment}
          minRows={4}
          maxRows={8}
          classNames={{
            input: 'text-gray-800 dark:text-gray-200',
            inputWrapper: 'border-2 border-gray-300 dark:border-gray-600',
          }}
        />
      </div>

      <Button
        type="submit"
        className="bg-gradient-to-tr from-[#F2B33D] to-[#F2B33D] text-white font-bold shadow-lg"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        isDisabled={rating === 0 || !comment.trim()}
      >
        เขียนรีวิว
      </Button>
    </form>
  );
}
