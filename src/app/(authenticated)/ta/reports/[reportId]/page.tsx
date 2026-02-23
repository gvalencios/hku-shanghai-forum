"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { getReportById, getReplies, updateReport } from "@/lib/firestore/reports";
import { getAllContactPersons } from "@/lib/firestore/contact-persons";
import { ReplyThread } from "@/components/reports/ReplyThread";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { Report, Reply, ReportStatus, ReportImportance, ContactPerson } from "@/lib/types/report";

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

export default function TAReportDetailPage() {
  const params = useParams();
  const { email, uid } = useAuth();
  const { toast } = useToast();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [r, reps, cts] = await Promise.all([
      getReportById(reportId),
      getReplies(reportId),
      getAllContactPersons(),
    ]);
    setReport(r);
    setReplies(reps);
    setContacts(cts);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [reportId]);

  const handleStatusChange = async (status: ReportStatus) => {
    await updateReport(reportId, { status });
    toast(`Status updated to ${status.replace("_", " ")}`);
    loadData();
  };

  const handleImportanceChange = async (importance: ReportImportance) => {
    await updateReport(reportId, { importance });
    toast(`Importance set to ${importance}`);
    loadData();
  };

  const handleLinkContact = async (contactId: string) => {
    if (!report) return;
    const ids = report.contactPersonIds.includes(contactId)
      ? report.contactPersonIds.filter((id) => id !== contactId)
      : [...report.contactPersonIds, contactId];
    await updateReport(reportId, { contactPersonIds: ids });
    toast("Contact updated");
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

  const linkedContacts = contacts.filter((c) =>
    report.contactPersonIds.includes(c.id)
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          {report.title}
        </h1>
        <p className="mt-1 text-[13px] text-[#86868B]">
          by {report.studentName} &middot; {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      {/* TA Controls */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Manage Report</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <Select
              label="Status"
              value={report.status}
              onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
              options={[
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              className="w-44"
            />
            <Select
              label="Importance"
              value={report.importance}
              onChange={(e) => handleImportanceChange(e.target.value as ReportImportance)}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
              className="w-44"
            />
          </div>

          {contacts.length > 0 && (
            <div className="mt-5 border-t border-[#F5F5F7] pt-4">
              <p className="mb-3 text-[13px] font-medium text-[#6E6E73]">
                Assign Contact Persons
              </p>
              <div className="flex flex-wrap gap-2">
                {contacts.map((c) => {
                  const linked = report.contactPersonIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleLinkContact(c.id)}
                      className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all ${
                        linked
                          ? "border-[#007AFF] bg-[#007AFF]/5"
                          : "border-[#E8E8ED] bg-white hover:border-[#007AFF]/40 hover:bg-[#F5F5F7]"
                      }`}
                    >
                      <span className={`text-[13px] font-semibold ${linked ? "text-[#007AFF]" : "text-[#1D1D1F]"}`}>
                        {c.name}
                      </span>
                      {(c.role || c.responsibilityArea) && (
                        <span className="mt-0.5 text-[11px] text-[#86868B]">
                          {[c.role, c.responsibilityArea].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Description</h3>
            <Badge variant={importanceVariant[report.importance]}>{report.importance}</Badge>
            <Badge variant={statusVariant[report.status]}>{report.status.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#1D1D1F]">
            {report.description}
          </p>
        </CardContent>
      </Card>

      {/* Linked contacts */}
      {linkedContacts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
              Assigned Contacts
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linkedContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#F5F5F7] px-3 py-2">
                  <div>
                    <p className="text-[14px] font-medium text-[#1D1D1F]">{c.name}</p>
                    <p className="text-[12px] text-[#86868B]">{c.role} &middot; {c.responsibilityArea}</p>
                  </div>
                  <div className="text-right text-[12px] text-[#6E6E73]">
                    <p>{c.phone}</p>
                    <p>{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ReplyThread
        reportId={reportId}
        replies={replies}
        currentUserId={uid ?? ""}
        currentUserName={email ?? "TA"}
        currentUserRole="ta"
        onReplyAdded={loadData}
      />
    </div>
  );
}
