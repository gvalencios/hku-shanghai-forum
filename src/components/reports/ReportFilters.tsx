"use client";

import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import type { ReportStatus, ReportImportance } from "@/lib/types/report";

interface ReportFiltersProps {
  status: ReportStatus | "all";
  onStatusChange: (s: ReportStatus | "all") => void;
  importance: ReportImportance | "all";
  onImportanceChange: (i: ReportImportance | "all") => void;
  reportCounts: Record<string, number>;
}

export function ReportFilters({
  status,
  onStatusChange,
  importance,
  onImportanceChange,
  reportCounts,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs
        tabs={[
          { id: "all", label: "All", count: reportCounts.all },
          { id: "open", label: "Open", count: reportCounts.open },
          { id: "in_progress", label: "In Progress", count: reportCounts.in_progress },
          { id: "resolved", label: "Resolved", count: reportCounts.resolved },
        ]}
        activeTab={status}
        onChange={(id) => onStatusChange(id as ReportStatus | "all")}
      />
      <Select
        value={importance}
        onChange={(e) => onImportanceChange(e.target.value as ReportImportance | "all")}
        options={[
          { value: "all", label: "All Importance" },
          { value: "urgent", label: "Urgent" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
        className="w-40"
      />
    </div>
  );
}
