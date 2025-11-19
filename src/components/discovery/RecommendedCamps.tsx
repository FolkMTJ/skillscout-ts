'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';

interface RecommendedCamp {
  id: string;
  name: string;
  reason: string;
  image: string;
}

interface RecommendedCampsProps {
  camps: RecommendedCamp[];
}

export default function RecommendedCamps({ camps }: RecommendedCampsProps) {
  const router = useRouter();

  if (camps.length === 0) {
    return (
      <div className="bg-gray-100 border-4 border-black p-8 text-center">
        <p className="text-lg font-bold mb-4">ยังไม่มีค่ายที่แนะนำในขณะนี้</p>
        <button
          onClick={() => router.push('/allcamps')}
          className="bg-black text-white px-6 py-3 font-bold border-4 border-black hover:bg-white hover:text-black transition-all"
        >
          ดูค่ายทั้งหมด
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {camps.map((camp) => (
        <div
          key={camp.id}
          className="bg-white border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
          onClick={() => router.push(`/camps/${camp.id}`)}
        >
          {/* Image */}
          <div className="relative h-48 bg-gray-200 border-b-4 border-black overflow-hidden">
            <Image
              src={camp.image || '/images/camp-placeholder.png'}
              alt={camp.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 bg-yellow-400 border-2 border-black px-3 py-1 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              แนะนำ
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h4 className="font-black text-lg line-clamp-2 group-hover:text-yellow-600 transition-colors">
              {camp.name}
            </h4>

            {/* Reason */}
            <div className="bg-yellow-50 border-2 border-black p-3">
              <div className="text-xs font-bold mb-1 opacity-70">เหมาะกับคุณเพราะ:</div>
              <p className="text-sm font-bold">{camp.reason}</p>
            </div>

            {/* CTA */}
            <button
              className="w-full bg-black text-white py-3 font-bold border-4 border-black flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-black transition-all"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/camps/${camp.id}`);
              }}
            >
              ดูรายละเอียด
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
