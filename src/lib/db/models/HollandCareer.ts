// src/lib/db/models/HollandCareer.ts
// MongoDB CRUD model สำหรับ Holland Code / IT Career (Admin จัดการได้)
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { RIASECCode } from '@/data/riasec';

export interface RoadmapStepDoc {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedCamps?: string[];
  duration?: string;
}

export interface HollandCareerDoc {
  _id?: ObjectId;
  id: string; // slug สำหรับ URL เช่น 'software-engineer'
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes: RIASECCode[];
  requiredTags: string[];
  recommendedTags: string[];
  roadmapSteps: RoadmapStepDoc[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // admin userId
}

export interface HollandCareerPublic extends Omit<HollandCareerDoc, '_id'> {
  _id: string;
}

export class HollandCareerModel {
  private static collectionName = 'holland_careers';

  private static toPublic(doc: HollandCareerDoc): HollandCareerPublic {
    const { _id, ...rest } = doc;
    return { ...rest, _id: _id?.toString() || '' };
  }

  static async findAll(includeInactive = false): Promise<HollandCareerPublic[]> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const filter = includeInactive ? {} : { isActive: true };
    const docs = await collection.find(filter as Filter<HollandCareerDoc>).sort({ nameTh: 1 }).toArray();
    return docs.map(this.toPublic);
  }

  static async findById(id: string): Promise<HollandCareerPublic | null> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const doc = await collection.findOne({ _id: new ObjectId(id) } as Filter<HollandCareerDoc>);
    return doc ? this.toPublic(doc) : null;
  }

  static async findBySlug(slug: string): Promise<HollandCareerPublic | null> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const doc = await collection.findOne({ id: slug } as Filter<HollandCareerDoc>);
    return doc ? this.toPublic(doc) : null;
  }

  static async create(data: Omit<HollandCareerDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<HollandCareerPublic> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const now = new Date();
    const doc: Omit<HollandCareerDoc, '_id'> = { ...data, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(doc);
    return this.toPublic({ ...doc, _id: result.insertedId });
  }

  static async update(id: string, data: Partial<Omit<HollandCareerDoc, '_id' | 'createdAt'>>): Promise<HollandCareerPublic | null> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const updateData = { ...data, updatedAt: new Date() };
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as Filter<HollandCareerDoc>,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result ? this.toPublic(result) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<HollandCareerDoc>);
    return result.deletedCount > 0;
  }

  static async count(): Promise<number> {
    const collection = await getCollection<HollandCareerDoc>(this.collectionName);
    return collection.countDocuments({});
  }
}
