export type InfoCategory = string;

export interface InfoCategoryDef {
  id: string;
  label: string;
}

export interface InfoBlock {
  id: string;
  title: string;
  body: string;
  category: InfoCategory;
  order: number;
  links: { label: string; url: string }[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const DEFAULT_CATEGORIES: InfoCategoryDef[] = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "assessment", label: "Assessment" },
  { id: "logistics", label: "Logistics" },
  { id: "contacts", label: "Contacts" },
  { id: "rules", label: "Rules" },
];

// Kept for backward compatibility — prefer using dynamic categories from Firestore
export const INFO_CATEGORIES: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.label])
);
