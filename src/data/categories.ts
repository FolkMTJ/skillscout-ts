import {
  IoMdCode,
  IoMdCloud,
} from "react-icons/io";
import {
  MdPhoneAndroid,
  MdDataObject,
  MdDesignServices,
  MdExtension,
  MdApps,
} from "react-icons/md";
import { FaServer } from "react-icons/fa";
import { IconType } from "react-icons";

export type TagCategoryKey = 'frontend' | 'backend' | 'data' | 'design' | 'mobile' | 'devops' | 'other';

export interface CategoryData {
  name: string;
  tagCategory: TagCategoryKey | null;
  icon: IconType;
  color: string; // hex accent color
}

export const categories: CategoryData[] = [
  {
    name: "ทั้งหมด",
    tagCategory: null,
    icon: MdApps,
    color: "#F2B33D",
  },
  {
    name: "Frontend",
    tagCategory: "frontend",
    icon: IoMdCode,
    color: "#3B82F6",
  },
  {
    name: "Backend",
    tagCategory: "backend",
    icon: FaServer,
    color: "#10B981",
  },
  {
    name: "Data & AI",
    tagCategory: "data",
    icon: MdDataObject,
    color: "#8B5CF6",
  },
  {
    name: "Design",
    tagCategory: "design",
    icon: MdDesignServices,
    color: "#EC4899",
  },
  {
    name: "Mobile",
    tagCategory: "mobile",
    icon: MdPhoneAndroid,
    color: "#F97316",
  },
  {
    name: "DevOps",
    tagCategory: "devops",
    icon: IoMdCloud,
    color: "#06B6D4",
  },
  {
    name: "อื่นๆ",
    tagCategory: "other",
    icon: MdExtension,
    color: "#6366F1",
  },
];
