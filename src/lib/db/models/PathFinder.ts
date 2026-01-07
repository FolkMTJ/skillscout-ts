// src/lib/db/models/PathFinder.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { PathFinderResult, PathFinderAnswer, RIASECScore } from '@/types';
import { RIASECCode } from '@/data/riasec';
import { PATH_FINDER_QUESTIONS } from '@/data/path-finder/questions';
import { getRecommendedCareers } from '@/data/path-finder/careers';

interface PathFinderResultDoc {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  answers: PathFinderAnswer[];
  riasecScores: RIASECScore;
  topRIASECCodes: RIASECCode[];
  recommendedCareers: string[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PathFinderModel {
  private static collectionName = 'pathfinder_results';

  private static toPublic(doc: PathFinderResultDoc): PathFinderResult {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  /**
   * คำนวณคะแนน RIASEC จากคำตอบ
   * แต่ละคำถามให้คะแนน 1-5, แต่ละหมวดมี 3 คำถาม
   * คะแนนเต็มต่อหมวด = 15 (3 คำถาม x 5 คะแนน)
   * แปลงเป็นเปอร์เซ็นต์ (0-100)
   */
  private static calculateRIASECScores(answers: PathFinderAnswer[]): RIASECScore {
    const scores: RIASECScore = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };

    // รวมคะแนนตามหมวด
    answers.forEach(answer => {
      const question = PATH_FINDER_QUESTIONS.find(q => q.id === answer.questionId);
      if (question) {
        scores[question.category] += answer.rating;
      }
    });

    // แปลงเป็นเปอร์เซ็นต์ (คะแนนเต็ม 15 ต่อหมวด)
    Object.keys(scores).forEach(key => {
      const code = key as RIASECCode;
      scores[code] = Math.round((scores[code] / 15) * 100);
    });

    return scores;
  }

  /**
   * หา top RIASEC codes (สูงสุด 2-3 อันดับแรก)
   */
  private static getTopRIASECCodes(scores: RIASECScore): RIASECCode[] {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([code]) => code as RIASECCode);
  }

  /**
   * บันทึกผลลัพธ์การทำแบบทดสอบ
   */
  static async create(data: {
    userId: string;
    userEmail: string;
    answers: PathFinderAnswer[];
  }): Promise<PathFinderResult> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);

    // คำนวณคะแนน
    const riasecScores = this.calculateRIASECScores(data.answers);
    const topRIASECCodes = this.getTopRIASECCodes(riasecScores);

    // แนะนำอาชีพ
    const recommendedCareers = getRecommendedCareers(riasecScores);
    const careerIds = recommendedCareers.map(career => career.id);

    const now = new Date();
    const resultDoc: Omit<PathFinderResultDoc, '_id'> = {
      userId: data.userId,
      userEmail: data.userEmail,
      answers: data.answers,
      riasecScores,
      topRIASECCodes,
      recommendedCareers: careerIds,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(resultDoc);

    return this.toPublic({
      ...resultDoc,
      _id: result.insertedId,
    });
  }

  /**
   * ดึงผลลัพธ์ล่าสุดของ user
   */
  static async findLatestByUserId(userId: string): Promise<PathFinderResult | null> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);
    
    const result = await collection
      .find({ userId } as Filter<PathFinderResultDoc>)
      .sort({ completedAt: -1 })
      .limit(1)
      .toArray();

    if (result.length === 0) return null;
    return this.toPublic(result[0]);
  }

  /**
   * ดึงผลลัพธ์ทั้งหมดของ user
   */
  static async findAllByUserId(userId: string): Promise<PathFinderResult[]> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);
    
    const results = await collection
      .find({ userId } as Filter<PathFinderResultDoc>)
      .sort({ completedAt: -1 })
      .toArray();

    return results.map(doc => this.toPublic(doc));
  }

  /**
   * ดึงผลลัพธ์โดย ID
   */
  static async findById(id: string): Promise<PathFinderResult | null> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);
    
    const result = await collection.findOne({ 
      _id: new ObjectId(id) 
    } as Filter<PathFinderResultDoc>);

    if (!result) return null;
    return this.toPublic(result);
  }

  /**
   * ลบผลลัพธ์
   */
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id) 
    } as Filter<PathFinderResultDoc>);

    return result.deletedCount > 0;
  }

  /**
   * นับจำนวนครั้งที่ user ทำแบบทดสอบ
   */
  static async countByUserId(userId: string): Promise<number> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);
    return collection.countDocuments({ userId } as Filter<PathFinderResultDoc>);
  }

  /**
   * ดึงสถิติการทำแบบทดสอบทั้งหมด
   */
  static async getStatistics(): Promise<{
    totalTests: number;
    uniqueUsers: number;
    topCareers: Array<{ careerId: string; count: number }>;
  }> {
    const collection = await getCollection<PathFinderResultDoc>(this.collectionName);

    const totalTests = await collection.countDocuments({});
    
    const uniqueUsers = await collection.distinct('userId');

    // หาอาชีพที่ถูกแนะนำมากที่สุด
    const careerCounts = await collection.aggregate([
      { $unwind: '$recommendedCareers' },
      { $group: { _id: '$recommendedCareers', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray();

    const topCareers = careerCounts.map(item => ({
      careerId: item._id as string,
      count: item.count as number,
    }));

    return {
      totalTests,
      uniqueUsers: uniqueUsers.length,
      topCareers,
    };
  }
}
