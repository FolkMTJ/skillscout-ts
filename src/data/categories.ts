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
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Mobile Development",
    icon: MdPhoneAndroid,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Data Science & AI",
    icon: MdDataObject,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Cybersecurity",
    icon: MdSecurity,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Cloud & DevOps",
    icon: IoMdCloud,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Game Development",
    icon: IoLogoGameControllerA,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "UI/UX Design",
    icon: MdDesignServices,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
  {
    name: "Networking",
    icon: MdRouter,
    gradient: "from-[#F2B33D] to-[#F2B33D]",
  },
];