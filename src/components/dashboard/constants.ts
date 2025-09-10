import { Code, FileText, Image, Link } from "lucide-react";

export const typeIcons = {
  text: FileText,
  image: Image,
  link: Link,
  code: Code,
};

export const typeColors = {
  text: "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-200/50 shadow-sm",
  image:
    "bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 border-green-200/50 shadow-sm",
  link: "bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-600 border-purple-200/50 shadow-sm",
  code: "bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-600 border-orange-200/50 shadow-sm",
};

// For HeroUI Chip components (simplified color mapping)
export const typeChipColors = {
  text: "primary",
  image: "success",
  link: "secondary",
  code: "warning",
} as const;
