"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { getReportsByStudent } from "@/lib/firestore/reports";
import { ReportCard } from "@/components/reports/ReportCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Report } from "@/lib/types/report";

export default function StudentReportsPage() {
  const { uid } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    getReportsByStudent(uid).then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            My Reports
          </h1>
          <p className="mt-1 text-[15px] text-[#6E6E73]">
            Submit and track incident reports
          </p>
        </div>
        <Link href="/reports/new">
          <Button>New Report</Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Submit a report if you encounter any issues during the trip."
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
          action={
            <Link href="/reports/new">
              <Button>Submit Report</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} href={`/reports/${r.id}`} showImportance={false} />
          ))}
        </div>
      )}
    </div>
  );
}
