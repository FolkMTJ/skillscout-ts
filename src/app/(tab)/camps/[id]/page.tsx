import { notFound } from "next/navigation";
import CampDetailView from "./CampDetailView";

async function getCampById(id: string) {
  try {
    // Fetch camp with view increment
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/camps/${id}?incrementView=true`,
      { 
        cache: 'no-store' // Don't cache to ensure view count is accurate
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching camp:', error);
    return null;
  }
}

// Add the 'async' keyword here
export default async function CampDetailPage({ params }: { params: { id: string } }) {
  
  // This 'await' now works correctly inside an async function
  const camp = await getCampById(params.id);

  // If no camp is found, show the 404 page
  if (!camp) {
    notFound();
  }

  // Pass the fetched data to the client component for display
  return <CampDetailView camp={camp} />;
}
