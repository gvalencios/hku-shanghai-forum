export type ReportStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type ReportImportance = "low" | "medium" | "high" | "urgent";

export interface Report {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  status: ReportStatus;
  importance: ReportImportance;
  contactPersonIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "student" | "ta";
  content: string;
  createdAt: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  responsibilityArea: string;
  createdBy: string;
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

export const IMPORTANCE_LABELS: Record<ReportImportance, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
