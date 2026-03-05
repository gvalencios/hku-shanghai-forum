"use client";

import { useEffect, useState } from "react";
import { getAllReports } from "@/lib/firestore/reports";
import { getAllStudents } from "@/lib/firestore/users";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Report, ReportStatus, ReportImportance } from "@/lib/types/report";

export default function TAReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [importanceFilter, setImportanceFilter] = useState<ReportImportance | "all">("all");

  useEffect(() => {
    Promise.all([getAllReports(), getAllStudents()]).then(([data, students]) => {
      setReports(data);
      const map: Record<string, string> = {};
      for (const s of students) {
        const name = [s.familyNameEn, s.firstNameEn].filter(Boolean).join(" ");
        if (name) map[s.id] = name;
      }
      setNameMap(map);
      setLoading(false);
    });
  }, []);

  const filtered = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (importanceFilter !== "all" && r.importance !== importanceFilter) return false;
    return true;
  });

  const counts = {
    all: reports.length,
    open: reports.filter((r) => r.status === "open").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Reports
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Triage and respond to student reports
        </p>
      </div>

      <ReportFilters
        status={statusFilter}
        onStatusChange={setStatusFilter}
        importance={importanceFilter}
        onImportanceChange={setImportanceFilter}
        reportCounts={counts}
      />

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="No reports found" description="Adjust filters or wait for students to submit reports." />
        ) : (
          filtered.map((r) => (
            <ReportCard key={r.id} report={r} href={`/ta/reports/${r.id}`} studentFullName={nameMap[r.studentId]} />
          ))
        )}
      </div>
    </div>
  );
}
