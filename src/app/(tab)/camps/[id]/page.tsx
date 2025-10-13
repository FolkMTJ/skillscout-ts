import { getCampById } from "@/lib/data"; // Assuming your data function is here
import CampDetailView from "./CampDetailView";
import { notFound } from "next/navigation";

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