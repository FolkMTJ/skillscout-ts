import connectDB from '@/lib/mongodb';
import Camp from '@/lib/models/Camp';

export interface Organizer {
  name: string;
  imageUrl: string;
}

export interface Qualifications {
  level: string;
  fields?: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CampData {
  _id: string;
  id?: string; // Legacy support
  name: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  galleryImages: string[];
  description: string;
  deadline: string;
  daysLeft?: number; // Legacy support - calculated field
  participantCount: number;
  activityFormat: string;
  qualifications: Qualifications;
  additionalInfo: string[];
  organizers?: Organizer[];
  reviews: Review[];
  avgRating: number;
  ratingBreakdown: { [key: string]: number };
  featured?: boolean;
  slug: string;
}

// Legacy type for backwards compatibility
export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// Get all camps
export async function getAllCamps(): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error fetching camps:', error);
    return [];
  }
}

// Legacy function name for backwards compatibility
export async function getCamps(): Promise<CampData[]> {
  return getAllCamps();
}

// Get camp by ID or slug
export async function getCampById(idOrSlug: string): Promise<CampData | null> {
  try {
    await connectDB;
    const camp = await Camp.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    }).lean();
    
    if (!camp) return null;
    
    return JSON.parse(JSON.stringify(camp));
  } catch (error) {
    console.error('Error fetching camp:', error);
    return null;
  }
}

// Get featured camps
export async function getFeaturedCamps(limit: number = 6): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.find({ featured: true })
      .sort({ avgRating: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error fetching featured camps:', error);
    return [];
  }
}

// Search camps
export async function searchCamps(query: string): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).lean();
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error searching camps:', error);
    return [];
  }
}

// Get camps by category
export async function getCampsByCategory(category: string): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.find({ category }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error fetching camps by category:', error);
    return [];
  }
}

// Get all categories with camp counts
export async function getCategories(): Promise<CategoryData[]> {
  try {
    await connectDB;
    const categories = await Camp.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          id: '$_id',
          name: '$_id',
          count: 1,
          icon: '🎯', // Default icon
          _id: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get urgent camps (closest deadline)
export async function getUrgentCamps(limit: number = 5): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.find({})
      .sort({ deadline: 1 }) // Sort by deadline ascending
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error fetching urgent camps:', error);
    return [];
  }
}

// Get trending camps (highest rated with most reviews)
export async function getTrendingCamps(limit: number = 6): Promise<CampData[]> {
  try {
    await connectDB;
    const camps = await Camp.aggregate([
      {
        $addFields: {
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $match: {
          reviewCount: { $gt: 0 }
        }
      },
      {
        $sort: {
          avgRating: -1,
          reviewCount: -1
        }
      },
      {
        $limit: limit
      }
    ]);
    return JSON.parse(JSON.stringify(camps));
  } catch (error) {
    console.error('Error fetching trending camps:', error);
    return [];
  }
}