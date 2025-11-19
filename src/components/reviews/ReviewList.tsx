// src/components/reviews/ReviewList.tsx
'use client';

import { Review } from '@/types';
import { FaStar } from 'react-icons/fa';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewCard = ({ review }: { review: Review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-800 dark:text-white">{review.author}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(review.date)}
        </span>
      </div>
      
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar
            key={i}
            size={16}
            className={i < review.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          {review.rating}/5
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีรีวิวสำหรับค่ายนี้</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          เป็นคนแรกที่แบ่งปันประสบการณ์!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
