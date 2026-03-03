import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import CampDetailView from "./CampDetailView";

async function getCampById(id: string) {
  try {
    // Creates an unnecessary HTTP call to itself
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/camps/${id}`);
    if (!response.ok) return null;
    return response.json();

  } catch (error) {
    console.error('Error fetching camp:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const camp = await getCampById(id);

  if (!camp) {
    return {
      title: "ไม่พบข้อมูลค่าย",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = camp.image || "/images/og-image.jpg";

  return {
    title: camp.name,
    description: camp.description?.substring(0, 160) || `รายละเอียดค่าย ${camp.name}`,
    openGraph: {
      title: `${camp.name} | SkillScout`,
      description: camp.description?.substring(0, 160) || `รายละเอียดค่าย ${camp.name}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: camp.name,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: camp.name,
      description: camp.description?.substring(0, 160),
      images: [ogImage],
    }
  };
}

export default async function CampDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const camp = await getCampById(id);

  if (!camp) {
    notFound();
  }

  return <CampDetailView camp={camp} />;
}
