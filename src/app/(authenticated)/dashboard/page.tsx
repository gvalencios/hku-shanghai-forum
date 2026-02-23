"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { getUserById } from "@/lib/firestore/users";
import { getAllStudents } from "@/lib/firestore/users";
import { getAllCheckpoints } from "@/lib/firestore/checkpoints";
import { getCheckinsByUser, getAllCheckins } from "@/lib/firestore/checkins";
import { getReportsByStudent, getAllReports } from "@/lib/firestore/reports";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import type { UserDocument } from "@/lib/types/user";
import type { Checkpoint, Checkin } from "@/lib/types/checkpoint";
import type { Report } from "@/lib/types/report";

export default function DashboardPage() {
  const { uid, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Student data
  const [profile, setProfile] = useState<UserDocument | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [myCheckins, setMyCheckins] = useState<Checkin[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);

  // TA data
  const [students, setStudents] = useState<(UserDocument & { id: string })[]>([]);
  const [allCheckins, setAllCheckins] = useState<Checkin[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!uid || authLoading) return;

    const load = async () => {
      try {
        const cps = await getAllCheckpoints();
        setCheckpoints(cps);

        if (role === "ta") {
          const [studs, cis, reps] = await Promise.all([
            getAllStudents(),
            getAllCheckins(),
            getAllReports(),
          ]);
          setStudents(studs);
          setAllCheckins(cis);
          setAllReports(reps);
        } else {
          const [prof, cis, reps] = await Promise.all([
            getUserById(uid),
            getCheckinsByUser(uid),
            getReportsByStudent(uid),
          ]);
          setProfile(prof);
          setMyCheckins(cis);
          setMyReports(reps);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uid, role, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (role === "ta") {
    return <TADashboard students={students} checkpoints={checkpoints} checkins={allCheckins} reports={allReports} />;
  }

  return (
    <StudentDashboard
      profile={profile}
      checkpoints={checkpoints}
      checkins={myCheckins}
      reports={myReports}
    />
  );
}

function StudentDashboard({
  profile,
  checkpoints,
  checkins,
  reports,
}: {
  profile: UserDocument | null;
  checkpoints: Checkpoint[];
  checkins: Checkin[];
  reports: Report[];
}) {
  const validCheckpointIds = new Set(checkpoints.map((cp) => cp.id));
  const completedCount = new Set(checkins.filter((c) => validCheckpointIds.has(c.checkpointId)).map((c) => c.checkpointId)).size;
  const totalCount = checkpoints.length;
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;

  // Profile completion — all student-fillable fields (visa notes excluded as optional)
  const fields = profile
    ? [
        profile.flightTicketStatus,
        profile.departureFlight?.date,
        profile.departureFlight?.time,
        profile.departureFlight?.flightNumber,
        profile.arrivalFlight?.date,
        profile.arrivalFlight?.time,
        profile.arrivalFlight?.flightNumber,
        profile.visaStatus,
      ]
    : [];
  const filledFields = fields.filter(Boolean).length;
  const profilePct = fields.length > 0 ? Math.round((filledFields / fields.length) * 100) : 0;

  // Incomplete section detection
  const flightIncomplete = profile
    ? !profile.flightTicketStatus ||
      !profile.departureFlight?.date ||
      !profile.departureFlight?.time ||
      !profile.departureFlight?.flightNumber ||
      !profile.arrivalFlight?.date ||
      !profile.arrivalFlight?.time ||
      !profile.arrivalFlight?.flightNumber
    : false;
  const visaIncomplete = profile ? !profile.visaStatus : false;
  const incompleteItems: string[] = [
    ...(flightIncomplete ? ["Flight Information"] : []),
    ...(visaIncomplete ? ["Visa Status"] : []),
  ];

  // Next checkpoint
  const checkedIds = new Set(checkins.map((c) => c.checkpointId));
  const nextCheckpoint = checkpoints.find((cp) => !checkedIds.has(cp.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Dashboard</h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Welcome back{profile?.firstNameEn ? `, ${profile.firstNameEn}` : ""}
        </p>
      </div>

      {incompleteItems.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#FF3B30]/20 bg-[#FF3B30]/[0.04] px-4 py-4">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#FF3B30] text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#FF3B30]">Action required</p>
            <p className="mt-0.5 text-[13px] text-[#6E6E73]">
              Please complete your{" "}
              {incompleteItems.map((item, i) => (
                <span key={item}>
                  <span className="font-medium text-[#1D1D1F]">{item}</span>
                  {i < incompleteItems.length - 1 ? " and " : ""}
                </span>
              ))}{" "}
              before the trip.
            </p>
          </div>
          <Link href="/profile">
            <Button size="sm" variant="danger">Complete Now</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Profile" value={`${profilePct}%`} subtitle="Complete" color="blue" href="/profile" />
        <StatCard title="Checkpoints" value={`${completedCount}/${totalCount}`} subtitle="Completed" color="green" href="/checkpoints" />
        <StatCard title="Reports" value={String(openReports)} subtitle="Open" color="orange" href="/reports" />
      </div>

      {nextCheckpoint && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Next Checkpoint</p>
              <p className="mt-1 text-[15px] font-medium text-[#1D1D1F]">{nextCheckpoint.name}</p>
            </div>
            <Link href="/checkpoints">
              <Button size="sm">Go to Checkpoints</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TADashboard({
  students,
  checkpoints,
  checkins,
  reports,
}: {
  students: (UserDocument & { id: string })[];
  checkpoints: Checkpoint[];
  checkins: Checkin[];
  reports: Report[];
}) {
  const urgentReports = reports.filter((r) => r.importance === "urgent" && r.status !== "resolved").length;
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;

  // Checkpoint progress
  const nonRecurringIds = new Set(checkpoints.filter((cp) => !cp.isRecurring).map((cp) => cp.id));
  const totalPossible = students.length * nonRecurringIds.size;
  const uniqueCheckins = new Set(
    checkins.filter((c) => nonRecurringIds.has(c.checkpointId)).map((c) => `${c.userId}:${c.checkpointId}`)
  ).size;
  const progressPct = totalPossible > 0 ? Math.round((uniqueCheckins / totalPossible) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">TA Dashboard</h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">Overview of all student activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Students" value={String(students.length)} subtitle="Enrolled" color="blue" href="/ta/students" />
        <StatCard title="Checkpoints" value={`${progressPct}%`} subtitle="Overall progress" color="green" href="/ta/checkpoints" />
        <StatCard title="Open Reports" value={String(openReports)} subtitle="Need attention" color="orange" href="/ta/reports" />
        <StatCard
          title="Urgent"
          value={String(urgentReports)}
          subtitle="Urgent reports"
          color={urgentReports > 0 ? "red" : "green"}
          href="/ta/reports"
        />
      </div>

      {urgentReports > 0 && (
        <Card className="mt-6 border-[#FF2D55]/20 bg-[#FF2D55]/[0.02]">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Badge variant="urgent">URGENT</Badge>
              <p className="text-[15px] font-medium text-[#1D1D1F]">
                {urgentReports} urgent report{urgentReports > 1 ? "s" : ""} need attention
              </p>
            </div>
            <Link href="/ta/reports">
              <Button size="sm" variant="danger">View Reports</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "orange" | "red";
  href: string;
}) {
  const colorMap = {
    blue: "text-[#007AFF]",
    green: "text-[#30D158]",
    orange: "text-[#FF9F0A]",
    red: "text-[#FF2D55]",
  };

  return (
    <Link href={href} className="h-full">
      <Card className="h-full transition-all hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
        <CardContent className="flex flex-col py-5">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B]">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">{value}</p>
          <p className={`mt-1.5 text-[12px] font-semibold ${colorMap[color]}`}>{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
