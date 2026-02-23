"use client";

import Link from "next/link";
import type { Report, ReportStatus, ReportImportance } from "@/lib/types/report";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const statusVariant: Record<ReportStatus, "default" | "primary" | "success" | "warning" | "danger"> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  cancelled: "default",
};

const importanceVariant: Record<ReportImportance, "default" | "primary" | "warning" | "danger" | "urgent"> = {
  low: "default",
  medium: "primary",
  high: "danger",
  urgent: "urgent",
};

interface ReportCardProps {
  report: Report;
  href: string;
  showImportance?: boolean;
}

export function ReportCard({ report, href, showImportance = true }: ReportCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
        <CardContent className="py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-[#1D1D1F]">
                {report.title}
              </p>
              <p className="mt-0.5 text-[13px] text-[#86868B]">
                {report.studentName} &middot;{" "}
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-1.5">
              {showImportance && (
                <Badge variant={importanceVariant[report.importance]}>
                  {report.importance}
                </Badge>
              )}
              <Badge variant={statusVariant[report.status]}>
                {report.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          {report.description && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6E6E73]">
              {report.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
