import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// โหลด environment variables
config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

    await mongoose.connect(MONGODB_URI);

    console.log('✅ Successfully connected to MongoDB!');
    
    // ตรวจสอบก่อนใช้งาน db
    if (mongoose.connection.db) {
      console.log('📊 Database:', mongoose.connection.db.databaseName);
      
      // ทดสอบ query
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None');
    }
    
    console.log('🌐 Host:', mongoose.connection.host);

    await mongoose.connection.close();
    console.log('👋 Connection closed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

testConnection();