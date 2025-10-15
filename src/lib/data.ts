// src/lib/data.ts
import { CampModel } from '@/lib/db/models';
import { Camp, Organizer, Qualifications, Review } from '@/types';
import { IconType } from 'react-icons';
import {
  IoMdCode,
  IoMdCloud,
  IoLogoGameControllerA,
} from 'react-icons/io';
import {
  MdPhoneAndroid,
  MdDataObject,
  MdSecurity,
  MdDesignServices,
  MdRouter,
} from 'react-icons/md';

export interface CategoryData {
  name: string;
  icon: IconType;
  gradient: string;
}

// Use export type for type-only exports
export type { Organizer, Qualifications, Review };

export const categories: CategoryData[] = [
  { name: 'Web Development', icon: IoMdCode, gradient: 'from-blue-500 to-sky-500' },
  { name: 'Mobile Development', icon: MdPhoneAndroid, gradient: 'from-green-500 to-emerald-500' },
  { name: 'Data Science & AI', icon: MdDataObject, gradient: 'from-purple-500 to-violet-500' },
  { name: 'Cybersecurity', icon: MdSecurity, gradient: 'from-red-500 to-rose-500' },
  { name: 'Cloud & DevOps', icon: IoMdCloud, gradient: 'from-orange-500 to-amber-500' },
  { name: 'Game Development', icon: IoLogoGameControllerA, gradient: 'from-indigo-500 to-fuchsia-500' },
  { name: 'UI/UX Design', icon: MdDesignServices, gradient: 'from-pink-500 to-cyan-500' },
  { name: 'Networking', icon: MdRouter, gradient: 'from-gray-500 to-slate-500' },
];

export async function getAllCamps(): Promise<Camp[]> {
  try {
    return await CampModel.findAll();
  } catch (error) {
    console.error('Error fetching camps:', error);
    return [];
  }
}

export async function getCampById(idOrSlug: string): Promise<Camp | null> {
  try {
    let camp = await CampModel.findById(idOrSlug);
    if (!camp) {
      camp = await CampModel.findBySlug(idOrSlug);
    }
    return camp;
  } catch (error) {
    console.error('Error fetching camp:', error);
    return null;
  }
}

export async function getFeaturedCamps(limit: number = 6): Promise<Camp[]> {
  try {
    return await CampModel.getFeatured(limit);
  } catch (error) {
    console.error('Error fetching featured camps:', error);
    return [];
  }
}

export async function searchCamps(query: string): Promise<Camp[]> {
  try {
    return await CampModel.search(query);
  } catch (error) {
    console.error('Error searching camps:', error);
    return [];
  }
}

export async function getCampsByCategory(category: string): Promise<Camp[]> {
  try {
    return await CampModel.findByCategory(category);
  } catch (error) {
    console.error('Error fetching camps by category:', error);
    return [];
  }
}

export async function getCategories(): Promise<Array<{ name: string; count: number }>> {
  try {
    return await CampModel.getCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getTrendingCamps(limit: number = 6): Promise<Camp[]> {
  try {
    return await CampModel.getTrending(limit);
  } catch (error) {
    console.error('Error fetching trending camps:', error);
    return [];
  }
}

export { categories as allCategories };
