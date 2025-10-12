import {
  IoMdCode,
  IoMdCloud,
  IoLogoGameControllerA,
} from "react-icons/io";
import {
  MdPhoneAndroid,
  MdDataObject,
  MdSecurity,
  MdDesignServices,
  MdRouter,
} from "react-icons/md";
import { IconType } from "react-icons";

export interface CategoryData {
  name: string;
  icon: IconType;
  gradient: string;
}

export const categories: CategoryData[] = [
  {
    name: "Web Development",
    icon: IoMdCode,
    gradient: "from-blue-500 to-sky-500",
  },
  {
    name: "Mobile Development",
    icon: MdPhoneAndroid,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Data Science & AI",
    icon: MdDataObject,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    name: "Cybersecurity",
    icon: MdSecurity,
    gradient: "from-red-500 to-rose-500",
  },
  {
    name: "Cloud & DevOps",
    icon: IoMdCloud,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    name: "Game Development",
    icon: IoLogoGameControllerA,
    gradient: "from-indigo-500 to-fuchsia-500",
  },
  {
    name: "UI/UX Design",
    icon: MdDesignServices,
    gradient: "from-pink-500 to-cyan-500",
  },
  {
    name: "Networking",
    icon: MdRouter,
    gradient: "from-gray-500 to-slate-500",
  },
];