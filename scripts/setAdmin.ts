// scripts/setAdmin.ts
// Run: npx ts-node scripts/setAdmin.ts

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillscout';
const ADMIN_EMAIL = 'folkmtj.one@gmail.com';

async function setAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db();
    const users = db.collection('users');

    // Find user by email
    const user = await users.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      console.log('✗ User not found with email:', ADMIN_EMAIL);
      console.log('Creating admin user...');

      // Create admin user
      const result = await users.insertOne({
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✓ Admin user created with ID:', result.insertedId);
    } else {
      console.log('✓ User found:', user.email);
      console.log('Current role:', user.role);

      // Update role to admin
      const result = await users.updateOne(
        { email: ADMIN_EMAIL },
        { 
          $set: { 
            role: 'admin',
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log('✓ Role updated to ADMIN');
      } else {
        console.log('ℹ User is already ADMIN');
      }
    }

    console.log('\n=== ADMIN SETUP COMPLETE ===');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Role: admin');
    console.log('===========================\n');

  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    await client.close();
    console.log('✓ Connection closed');
  }
}

setAdmin();
