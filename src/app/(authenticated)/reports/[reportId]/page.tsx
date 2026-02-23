"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { getReportById, getReplies, updateReport } from "@/lib/firestore/reports";
import { ReplyThread } from "@/components/reports/ReplyThread";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { Report, Reply, ReportStatus } from "@/lib/types/report";

const statusVariant: Record<ReportStatus, "default" | "primary" | "success" | "warning" | "danger"> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  cancelled: "default",
};

export default function StudentReportDetailPage() {
  const params = useParams();
  const { email, uid, role } = useAuth();
  const { toast } = useToast();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [r, reps] = await Promise.all([
      getReportById(reportId),
      getReplies(reportId),
    ]);
    setReport(r);
    setReplies(reps);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [reportId]);

  const handleCancel = async () => {
    if (!report) return;
    await updateReport(reportId, { status: "cancelled" });
    toast("Report cancelled");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!report) {
    return <div className="py-20 text-center text-[#86868B]">Report not found</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
              {report.title}
            </h1>
            <p className="mt-1 text-[13px] text-[#86868B]">
              Submitted {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={statusVariant[report.status]}>
              {report.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Description</h3>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#1D1D1F]">
            {report.description}
          </p>
        </CardContent>
      </Card>

      {report.status === "open" && report.studentId === uid && (
        <div className="mb-6">
          <Button variant="ghost" className="text-[#FF3B30]" onClick={handleCancel}>
            Cancel Report
          </Button>
        </div>
      )}

      <ReplyThread
        reportId={reportId}
        replies={replies}
        currentUserId={uid ?? ""}
        currentUserName={email ?? "Student"}
        currentUserRole={role ?? "student"}
        onReplyAdded={loadData}
      />
    </div>
  );
}
