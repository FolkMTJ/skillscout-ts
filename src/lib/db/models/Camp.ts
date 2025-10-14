// src/lib/db/models/Camp.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';

// Type Definitions
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

export interface Camp {
  _id: string;
  name: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  galleryImages: string[];
  description: string;
  deadline: string;
  participantCount: number;
  activityFormat: string;
  qualifications: Qualifications;
  additionalInfo: string[];
  organizers?: Organizer[];
  reviews: Review[];
  avgRating: number;
  ratingBreakdown: Record<string, number>;
  featured?: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Internal MongoDB document type
interface CampDoc {
  _id?: ObjectId;
  name: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  galleryImages: string[];
  description: string;
  deadline: string;
  participantCount: number;
  activityFormat: string;
  qualifications: Qualifications;
  additionalInfo: string[];
  organizers?: Organizer[];
  reviews: Review[];
  avgRating: number;
  ratingBreakdown: Record<string, number>;
  featured?: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CampModel {
  private static collectionName = 'camps';

  // Helper: Convert MongoDB doc to public Camp
  private static toPublic(doc: CampDoc): Camp {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  // Helper: Generate slug from name
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Create
  static async create(campData: Omit<Camp, '_id' | 'createdAt' | 'updatedAt' | 'avgRating' | 'ratingBreakdown'>): Promise<Camp> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    
    const now = new Date();
    const camp: CampDoc = {
      ...campData,
      slug: campData.slug || this.generateSlug(campData.name),
      avgRating: 0,
      ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      reviews: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(camp);
    return { ...camp, _id: result.insertedId.toString() };
  }

  // Find by ID
  static async findById(id: string): Promise<Camp | null> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) };
    const camp = await collection.findOne(filter) as CampDoc | null;
    
    if (!camp) return null;
    return this.toPublic(camp);
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<Camp | null> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = { slug };
    const camp = await collection.findOne(filter) as CampDoc | null;
    
    if (!camp) return null;
    return this.toPublic(camp);
  }

  // Find all
  static async findAll(options?: { featured?: boolean }): Promise<Camp[]> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = options?.featured ? { featured: true } : {};
    const camps = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray() as CampDoc[];
    
    return camps.map(this.toPublic);
  }

  // Find by category
  static async findByCategory(category: string): Promise<Camp[]> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = { category };
    const camps = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray() as CampDoc[];
    
    return camps.map(this.toPublic);
  }

  // Search
  static async search(query: string): Promise<Camp[]> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    };
    const camps = await collection.find(filter).toArray() as CampDoc[];
    
    return camps.map(this.toPublic);
  }

  // Update
  static async update(id: string, updates: Partial<Omit<Camp, '_id'>>): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) };
    const update: UpdateFilter<CampDoc> = {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  // Add review
  static async addReview(id: string, review: Review): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) };
    
    // Get current camp
    const camp = await collection.findOne(filter) as CampDoc | null;
    if (!camp) return false;
    
    // Calculate new rating
    const currentReviews = camp.reviews || [];
    const allReviews = [...currentReviews, review];
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;
    
    // Calculate new breakdown
    const breakdown: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    allReviews.forEach(r => {
      breakdown[r.rating.toString()]++;
    });
    
    const update: UpdateFilter<CampDoc> = {
      $push: { reviews: review as never },
      $set: {
        avgRating,
        ratingBreakdown: breakdown,
        updatedAt: new Date(),
      },
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  // Delete
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) };
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  // Get categories with count
  static async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const collection = await getCollection(this.collectionName);
    
    const categories = await collection.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]).toArray();
    
    return categories as Array<{ name: string; count: number }>;
  }

  // Get featured camps
  static async getFeatured(limit: number = 6): Promise<Camp[]> {
    const collection = await getCollection(this.collectionName);
    const filter: Filter<CampDoc> = { featured: true };
    const camps = await collection
      .find(filter)
      .sort({ avgRating: -1 })
      .limit(limit)
      .toArray() as CampDoc[];
    
    return camps.map(this.toPublic);
  }

  // Get trending camps
  static async getTrending(limit: number = 6): Promise<Camp[]> {
    const collection = await getCollection(this.collectionName);
    
    const camps = await collection.aggregate([
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
        },
      },
      {
        $match: {
          reviewCount: { $gt: 0 },
        },
      },
      {
        $sort: {
          avgRating: -1,
          reviewCount: -1,
        },
      },
      {
        $limit: limit,
      },
    ]).toArray() as CampDoc[];
    
    return camps.map(this.toPublic);
  }
}