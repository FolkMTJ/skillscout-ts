// src/lib/db/ensureIndexes.ts
// Call once at app startup to ensure MongoDB indexes exist
import { getCollection } from '@/lib/mongodb';

let indexesCreated = false;

export async function ensureIndexes() {
  if (indexesCreated) return;
  indexesCreated = true;

  try {
    const camps = await getCollection('camps');
    await camps.createIndexes([
      { key: { status: 1 } },
      { key: { organizerId: 1 } },
      { key: { category: 1 } },
      { key: { registrationDeadline: 1 } },
      { key: { views: -1 } },
      { key: { createdAt: -1 } },
      { key: { status: 1, registrationDeadline: 1 } },
      { key: { status: 1, views: -1 } },
      { key: { name: 'text', description: 'text', category: 'text' } },
    ]);

    const registrations = await getCollection('registrations');
    await registrations.createIndexes([
      { key: { userId: 1 } },
      { key: { campId: 1 } },
      { key: { status: 1 } },
      { key: { userId: 1, campId: 1 } },
    ]);

    const users = await getCollection('users');
    await users.createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
    ]);
  } catch (err) {
    // Index creation errors are non-fatal (e.g. index already exists)
    console.error('[ensureIndexes] error:', err);
  }
}
