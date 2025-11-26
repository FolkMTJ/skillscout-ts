'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardFooter, Button, Chip } from '@heroui/react';
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
      <Card>
        <CardBody className="text-center p-8">
          <p className="text-lg font-semibold mb-4 text-gray-600">ยังไม่มีค่ายที่แนะนำในขณะนี้</p>
          <Button
            color="warning"
            onPress={() => router.push('/allcamps')}
          >
            ดูค่ายทั้งหมด
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {camps.map((camp) => (
        <Card
          key={camp.id}
          className="overflow-hidden cursor-pointer hover:scale-105 transition-transform"
        >
          {/* Image */}
          <div 
            className="relative h-48 w-full bg-gray-200"
            onClick={() => router.push(`/camps/${camp.id}`)}
          >
            <Image
              src={camp.image || '/images/camp-placeholder.png'}
              alt={camp.name}
              fill
              className="object-cover"
            />
            <Chip
              color="warning"
              variant="solid"
              size="sm"
              className="absolute top-3 right-3 font-semibold"
            >
              แนะนำ
            </Chip>
          </div>

          {/* Content */}
          <CardBody className="p-4 space-y-3">
            <h4 
              className="font-bold text-lg line-clamp-2 cursor-pointer hover:text-warning-600 transition-colors"
              onClick={() => router.push(`/camps/${camp.id}`)}
            >
              {camp.name}
            </h4>

            {/* Reason */}
            <Card className="bg-warning-50">
              <CardBody className="p-3">
                <div className="text-xs font-semibold mb-1 text-gray-600">เหมาะกับคุณเพราะ:</div>
                <p className="text-sm font-medium">{camp.reason}</p>
              </CardBody>
            </Card>
          </CardBody>

          {/* CTA */}
          <CardFooter className="p-4 pt-0">
            <Button
              color="warning"
              className="w-full font-semibold"
              endContent={<FiArrowRight />}
              onPress={() => router.push(`/camps/${camp.id}`)}
            >
              ดูรายละเอียด
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
