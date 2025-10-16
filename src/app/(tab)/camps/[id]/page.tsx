import { notFound } from "next/navigation";
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
