// src/app/api/admin/set-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// POST /api/admin/set-role - Set user role to admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, secretKey } = body;

    // Simple security - require secret key
    if (secretKey !== 'skillscout-admin-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    console.log('=== SET USER ROLE ===');
    console.log('Email:', email);
    console.log('New Role:', role);

    const users = await getCollection('users');
    
    // Find user
    const user = await users.findOne({ email });

    if (!user) {
      // Create user if not exists
      const createResult = await users.insertOne({
        email,
        name: email.split('@')[0],
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✓ User created with role:', role);
      
      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        userId: createResult.insertedId.toString(),
        role
      });
    } else {
      // Update existing user role
      await users.updateOne(
        { email },
        { 
          $set: { 
            role,
            updatedAt: new Date()
          } 
        }
      );

      console.log('✓ User role updated to:', role);

      return NextResponse.json({
        success: true,
        message: 'Role updated successfully',
        userId: user._id.toString(),
        previousRole: user.role,
        newRole: role
      });
    }

  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Failed to set role' },
      { status: 500 }
    );
  }
}
