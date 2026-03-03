import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { RIASECCode } from '@/data/riasec';

export interface TagDoc {
    _id?: ObjectId;
    id: string; // แนะนำเป็นตัวพิมพ์เล็กหรือตัวเลข ขีดกลาง (slug) เช่น 'html-css'
    name: string;
    nameTh: string;
    category: 'frontend' | 'backend' | 'data' | 'design' | 'mobile' | 'devops' | 'other';
    riasecMapping: {
        code: RIASECCode;
        weight: number; // 0-1
    }[];
    isCore: boolean;
    isActive: boolean; // เผื่อต้องการซ่อนไม่ให้ใช้งาน
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string; // admin userId
}

export interface TagPublic extends Omit<TagDoc, '_id'> {
    _id: string;
}

export class TagModel {
    private static collectionName = 'tags';

    private static toPublic(doc: TagDoc): TagPublic {
        const { _id, ...rest } = doc;
        return { ...rest, _id: _id?.toString() || '' };
    }

    static async findAll(includeInactive = false): Promise<TagPublic[]> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        const filter = includeInactive ? {} : { isActive: true };
        const docs = await collection.find(filter as Filter<TagDoc>).sort({ nameTh: 1 }).toArray();
        return docs.map(this.toPublic);
    }

    static async findById(id: string): Promise<TagPublic | null> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        try {
            const doc = await collection.findOne({ _id: new ObjectId(id) } as Filter<TagDoc>);
            return doc ? this.toPublic(doc) : null;
        } catch {
            return null;
        }
    }

    static async findBySlug(slug: string): Promise<TagPublic | null> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        const doc = await collection.findOne({ id: slug } as Filter<TagDoc>);
        return doc ? this.toPublic(doc) : null;
    }

    static async create(data: Omit<TagDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<TagPublic> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        const now = new Date();
        const doc: Omit<TagDoc, '_id'> = { ...data, createdAt: now, updatedAt: now };
        const result = await collection.insertOne(doc);
        return this.toPublic({ ...doc, _id: result.insertedId });
    }

    static async update(id: string, data: Partial<Omit<TagDoc, '_id' | 'createdAt'>>): Promise<TagPublic | null> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        const updateData = { ...data, updatedAt: new Date() };
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as Filter<TagDoc>,
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result ? this.toPublic(result) : null;
    }

    static async delete(id: string): Promise<boolean> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        try {
            const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<TagDoc>);
            return result.deletedCount > 0;
        } catch {
            return false;
        }
    }

    static async count(): Promise<number> {
        const collection = await getCollection<TagDoc>(this.collectionName);
        return collection.countDocuments({});
    }

    static async insertMany(tags: Omit<TagDoc, '_id'>[]): Promise<boolean> {
        if (tags.length === 0) return true;
        const collection = await getCollection<TagDoc>(this.collectionName);
        const result = await collection.insertMany(tags);
        return result.insertedCount === tags.length;
    }
}
