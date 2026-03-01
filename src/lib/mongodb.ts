// src/lib/mongodb.ts
import { MongoClient, Db, Document } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Use a global variable to preserve the connection across hot reloads (dev)
// and across serverless function invocations (prod) within the same instance
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Export the clientPromise for direct use
export default clientPromise;

// Connect to database function
export async function connectDB(): Promise<MongoClient> {
  return await clientPromise;
}

// Helper function to get database
export async function getDatabase(dbName: string = 'SkillScoutDB'): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper function to get a collection
export async function getCollection<T extends Document = Document>(
  collectionName: string,
  dbName: string = 'SkillScoutDB'
) {
  const db = await getDatabase(dbName);
  return db.collection<T>(collectionName);
}
