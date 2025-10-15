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

export type CampStatus = 'draft' | 'active' | 'closed' | 'cancelled';

export interface Camp {
  _id: string;
  id?: string; // Legacy support - same as _id
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
  ratingBreakdown: Record<string, number>;
  featured?: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Organizer fields
  organizerId?: string;
  organizerName?: string;
  organizerEmail?: string;
  // Additional fields
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  capacity?: number;
  enrolled?: number;
  fee?: number;
  tags?: string[];
  status?: CampStatus;
  views?: number; // NEW: Track views for trending
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
  organizerId?: string;
  organizerName?: string;
  organizerEmail?: string;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  capacity?: number;
  enrolled?: number;
  fee?: number;
  tags?: string[];
  status?: CampStatus;
  views?: number;
}

// Type for creating new camp (without _id)
export type CampInput = Omit<CampDoc, '_id'>;

export class CampModel {
  private static collectionName = 'camps';

  // Helper: Convert MongoDB doc to public Camp
  private static toPublic(doc: CampDoc): Camp {
    const { _id, ...rest } = doc;
    const idString = _id?.toString() || '';
    
    // Calculate daysLeft from deadline
    let daysLeft: number | undefined;
    if (doc.deadline) {
      try {
        const deadlineDate = new Date(doc.deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysLeft = diffDays > 0 ? diffDays : 0;
      } catch {
        daysLeft = undefined;
      }
    }
    
    return {
      ...rest,
      _id: idString,
      id: idString,
      daysLeft,
      views: doc.views || 0, // Ensure views is always a number
      organizerId: doc.organizerId,
      organizerName: doc.organizerName,
      organizerEmail: doc.organizerEmail,
      startDate: doc.startDate,
      endDate: doc.endDate,
      registrationDeadline: doc.registrationDeadline,
      capacity: doc.capacity,
      enrolled: doc.enrolled,
      fee: doc.fee,
      tags: doc.tags,
      status: doc.status,
    };
  }

  // Helper: Generate slug from name
  private static generateSlug(name: string): string {
    if (!name || name.trim() === '') {
      return `camp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (!slug || slug === '' || slug === '-') {
      return `camp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    
    return slug;
  }

  // Create
  static async create(campData: Partial<CampDoc>): Promise<Camp> {
    try {
      const collection = await getCollection<CampDoc>(this.collectionName);
      
      const now = new Date();
      const campDoc: CampDoc = {
        name: campData.name || '',
        category: campData.category || '',
        date: campData.date || '',
        location: campData.location || '',
        price: campData.price || '',
        image: campData.image || '',
        galleryImages: campData.galleryImages || [],
        description: campData.description || '',
        deadline: campData.deadline || '',
        participantCount: campData.participantCount || 0,
        activityFormat: campData.activityFormat || '',
        qualifications: campData.qualifications || { level: '' },
        additionalInfo: campData.additionalInfo || [],
        organizers: campData.organizers || [],
        slug: campData.slug || this.generateSlug(campData.name || ''),
        avgRating: campData.avgRating || 0,
        ratingBreakdown: campData.ratingBreakdown || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        reviews: campData.reviews || [],
        featured: campData.featured || false,
        views: 0, // Initialize views to 0
        createdAt: now,
        updatedAt: now,
        organizerId: campData.organizerId,
        organizerName: campData.organizerName,
        organizerEmail: campData.organizerEmail,
        startDate: campData.startDate,
        endDate: campData.endDate,
        registrationDeadline: campData.registrationDeadline,
        capacity: campData.capacity,
        enrolled: campData.enrolled || 0,
        fee: campData.fee,
        tags: campData.tags || [],
        status: campData.status,
      };
      
      const insertResult = await collection.insertOne(campDoc);
      const insertedId = insertResult.insertedId.toString();
      
      let daysLeft: number | undefined;
      if (campDoc.deadline) {
        try {
          const deadlineDate = new Date(campDoc.deadline);
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysLeft = diffDays > 0 ? diffDays : 0;
        } catch {
          daysLeft = undefined;
        }
      }
      
      const campResult: Camp = {
        _id: insertedId,
        id: insertedId,
        daysLeft,
        name: campDoc.name,
        category: campDoc.category,
        date: campDoc.date,
        location: campDoc.location,
        price: campDoc.price,
        image: campDoc.image,
        galleryImages: campDoc.galleryImages,
        description: campDoc.description,
        deadline: campDoc.deadline,
        participantCount: campDoc.participantCount,
        activityFormat: campDoc.activityFormat,
        qualifications: campDoc.qualifications,
        additionalInfo: campDoc.additionalInfo,
        organizers: campDoc.organizers,
        reviews: campDoc.reviews,
        avgRating: campDoc.avgRating,
        ratingBreakdown: campDoc.ratingBreakdown,
        featured: campDoc.featured,
        slug: campDoc.slug,
        views: campDoc.views,
        createdAt: campDoc.createdAt,
        updatedAt: campDoc.updatedAt,
        organizerId: campDoc.organizerId,
        organizerName: campDoc.organizerName,
        organizerEmail: campDoc.organizerEmail,
        startDate: campDoc.startDate,
        endDate: campDoc.endDate,
        registrationDeadline: campDoc.registrationDeadline,
        capacity: campDoc.capacity,
        enrolled: campDoc.enrolled,
        fee: campDoc.fee,
        tags: campDoc.tags,
        status: campDoc.status,
      };
      
      return campResult;
    } catch (error) {
      console.error('Error creating camp:', error);
      throw error;
    }
  }

  // Increment view count
  static async incrementViews(id: string): Promise<boolean> {
    try {
      const collection = await getCollection<CampDoc>(this.collectionName);
      const filter: Filter<CampDoc> = { _id: new ObjectId(id) } as Filter<CampDoc>;
      
      const update: UpdateFilter<CampDoc> = {
        $inc: { views: 1 },
        $set: { updatedAt: new Date() } as Partial<CampDoc>,
      };
      
      const result = await collection.updateOne(filter, update);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error incrementing views:', error);
      return false;
    }
  }

  // Find by ID (with optional view increment)
  static async findById(id: string, incrementView: boolean = false): Promise<Camp | null> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) } as Filter<CampDoc>;
    
    if (incrementView) {
      await this.incrementViews(id);
    }
    
    const camp = await collection.findOne(filter);
    if (!camp) return null;
    return this.toPublic(camp);
  }

  // Find by slug (with optional view increment)
  static async findBySlug(slug: string, incrementView: boolean = false): Promise<Camp | null> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = { slug } as Filter<CampDoc>;
    const camp = await collection.findOne(filter);
    
    if (!camp) return null;
    
    if (incrementView && camp._id) {
      await this.incrementViews(camp._id.toString());
    }
    
    return this.toPublic(camp);
  }

  // Find all
  static async findAll(options?: { featured?: boolean }): Promise<Camp[]> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = (options?.featured ? { featured: true } : {}) as Filter<CampDoc>;
    
    const camps = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return camps.map(doc => this.toPublic(doc));
  }

  // Find by category
  static async findByCategory(category: string): Promise<Camp[]> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = { category } as Filter<CampDoc>;
    
    const camps = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return camps.map(doc => this.toPublic(doc));
  }

  // Search
  static async search(query: string): Promise<Camp[]> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    } as Filter<CampDoc>;
    
    const camps = await collection.find(filter).toArray();
    return camps.map(doc => this.toPublic(doc));
  }

  // Update
  static async update(id: string, updates: Partial<Omit<Camp, '_id'>>): Promise<boolean> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) } as Filter<CampDoc>;
    const updateFields: Partial<CampDoc> = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const update: UpdateFilter<CampDoc> = {
      $set: updateFields as Partial<CampDoc>,
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  // Add review
  static async addReview(id: string, review: Review): Promise<boolean> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) } as Filter<CampDoc>;
    
    // Get current camp
    const camp = await collection.findOne(filter);
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
      } as Partial<CampDoc>,
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  // Delete
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = { _id: new ObjectId(id) } as Filter<CampDoc>;
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  // Get categories with count
  static async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    
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
    const collection = await getCollection<CampDoc>(this.collectionName);
    const filter: Filter<CampDoc> = { featured: true } as Filter<CampDoc>;
    
    const camps = await collection
      .find(filter)
      .sort({ avgRating: -1 })
      .limit(limit)
      .toArray();
    
    return camps.map(doc => this.toPublic(doc));
  }

  // Get trending camps (sorted by views)
  static async getTrending(limit: number = 6): Promise<Camp[]> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    
    const camps = await collection
      .find({})
      .sort({ views: -1, avgRating: -1 })
      .limit(limit)
      .toArray();
    
    return camps.map(doc => this.toPublic(doc));
  }

  // Count documents
  static async count(filter?: Filter<CampDoc>): Promise<number> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    return collection.countDocuments((filter || {}) as Filter<CampDoc>);
  }

  // Get paginated results
  static async findPaginated(
    page: number = 1,
    limit: number = 10,
    filter?: Filter<CampDoc>
  ): Promise<{ camps: Camp[]; total: number; pages: number }> {
    const collection = await getCollection<CampDoc>(this.collectionName);
    const skip = (page - 1) * limit;

    const camps = await collection
      .find((filter || {}) as Filter<CampDoc>)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments((filter || {}) as Filter<CampDoc>);
    const pages = Math.ceil(total / limit);

    return {
      camps: camps.map(doc => this.toPublic(doc)),
      total,
      pages,
    };
  }
}
