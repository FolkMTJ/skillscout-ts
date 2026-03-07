// src/components/reviews/ReviewList.tsx
'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { FaStar } from 'react-icons/fa';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { Textarea, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ReviewListProps {
  reviews: Review[];
  campId?: string;
  currentUserEmail?: string;
  onReviewUpdated?: (updatedReview: Review) => void;
  onReviewDeleted?: (reviewId: string) => void;
}

const StarRating = ({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          className={onRate ? 'transition-transform hover:scale-110' : 'cursor-default'}
          disabled={!onRate}
        >
          <FaStar
            size={onRate ? 20 : 15}
            className={star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({
  review,
  campId,
  isOwner,
  onUpdated,
  onDeleted,
}: {
  review: Review;
  campId?: string;
  isOwner: boolean;
  onUpdated?: (updated: Review) => void;
  onDeleted?: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSave = async () => {
    if (!editComment.trim() || editRating === 0) { toast.error('กรุณากรอกข้อมูลให้ครบ'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/camps/${campId}/reviews`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, rating: editRating, comment: editComment }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success('แก้ไขรีวิวสำเร็จ!');
      onUpdated?.(data.review);
      setIsEditing(false);
    } catch { toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/camps/${campId}/reviews`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id }),
      });
      if (!res.ok) throw new Error();
      toast.success('ลบรีวิวแล้ว');
      onDeleted?.(review.id);
      setShowDeleteModal(false);
    } catch { toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    finally { setDeleting(false); }
  };

  // ── render ──────────────────────────────────────────────────────────────────

  // ชื่อแสดง — เอาชื่อจาก author โดยตรง (API ใหม่เก็บชื่อจริงแล้ว)
  // fallback: ถ้า author ยังเป็น email เก่า ตัดหน้า @ ไว้ก่อน
  const displayName = review.author?.includes('@')
    ? review.author.split('@')[0]
    : (review.author || 'ผู้ใช้งาน');

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Avatar — รูป profile จริง หรือ fallback ตัวอักษร */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#F2B33D] to-orange-400 flex items-center justify-center text-white text-sm font-bold">
              {review.authorImage ? (
                <Image
                  src={review.authorImage}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{displayName[0]?.toUpperCase() ?? '?'}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#F2B33D] bg-[#FFF3D0] hover:bg-[#FFE8A0] transition-colors"
              >
                <Pencil size={11} />
                แก้ไข
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={11} />
                ลบ
              </button>
            </div>
          )}
        </div>

        {/* Edit mode */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">คะแนน</p>
              <StarRating rating={editRating} onRate={setEditRating} />
            </div>
            <Textarea
              value={editComment}
              onValueChange={setEditComment}
              minRows={3}
              maxRows={6}
              placeholder="แก้ไขความคิดเห็น..."
              classNames={{ inputWrapper: 'border border-[#F2B33D]/50 bg-[#FFFDF5]' }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#F2B33D] text-white font-bold shadow-sm"
                onPress={handleSave}
                isLoading={saving}
                startContent={!saving ? <Check size={13} /> : undefined}
              >
                บันทึก
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="text-gray-500"
                onPress={() => { setEditRating(review.rating); setEditComment(review.comment); setIsEditing(false); }}
                startContent={<X size={13} />}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} />
              <span className="text-xs font-bold text-amber-500">{review.rating}/5</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-base font-bold text-gray-800">ยืนยันการลบรีวิว</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-500">
              ต้องการลบรีวิวนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" className="text-gray-500" onPress={() => setShowDeleteModal(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-red-500 text-white font-bold"
              onPress={handleDelete}
              isLoading={deleting}
              startContent={!deleting ? <Trash2 size={14} /> : undefined}
            >
              ลบรีวิว
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default function ReviewList({
  reviews,
  campId,
  currentUserEmail,
  onReviewUpdated,
  onReviewDeleted,
}: ReviewListProps) {
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);

  const handleUpdated = (updated: Review) => {
    setLocalReviews(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    onReviewUpdated?.(updated);
  };

  const handleDeleted = (id: string) => {
    setLocalReviews(prev => prev.filter(r => r.id !== id));
    onReviewDeleted?.(id);
  };

  if (localReviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีรีวิวสำหรับค่ายนี้</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">เป็นคนแรกที่แบ่งปันประสบการณ์!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {localReviews.map(review => (
        <ReviewCard
          key={review.id}
          review={review}
          campId={campId}
          isOwner={!!currentUserEmail && (review.authorEmail === currentUserEmail || review.author === currentUserEmail)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
