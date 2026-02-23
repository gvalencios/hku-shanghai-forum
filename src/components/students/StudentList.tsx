"use client";

import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import type { UserDocument } from "@/lib/types/user";

interface StudentListProps {
  students: (UserDocument & { id: string })[];
  onRowClick?: (student: UserDocument & { id: string }) => void;
}

function FlightCell({ flight }: { flight?: { date?: string; time?: string; flightNumber?: string } }) {
  if (!flight?.date && !flight?.time) return <span className="text-[#86868B]">—</span>;

  const date = flight.date
    ? new Date(flight.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;
  const time = flight.time ?? null;

  return (
    <div className="flex flex-col gap-0.5">
      {date && <span className="text-[13px] font-medium text-[#1D1D1F]">{date}</span>}
      {time && <span className="text-[11px] text-[#86868B]">{time}</span>}
    </div>
  );
}

export function StudentList({ students, onRowClick }: StudentListProps) {
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: UserDocument & { id: string }) => (
        <span className="font-medium">
          {row.familyNameEn} {row.firstNameEn}
          {row.fullChineseName && (
            <span className="ml-1.5 text-[#86868B]">{row.fullChineseName}</span>
          )}
        </span>
      ),
    },
    { key: "email", header: "Email" },
    { key: "studentId", header: "Student ID" },
    { key: "faculty", header: "Faculty" },
    { key: "gender", header: "Gender" },
    { key: "passportCountry", header: "Passport Country" },
    {
      key: "hasChinaBankAccount",
      header: "China Bank",
      render: (row: UserDocument) => (
        <span className={row.hasChinaBankAccount ? "text-[#30D158]" : "text-[#86868B]"}>
          {row.hasChinaBankAccount ? "Yes" : "No"}
        </span>
      ),
    },
    { key: "telephone", header: "Telephone" },
    {
      key: "specialRequest",
      header: "Special Request",
      render: (row: UserDocument) => (
        <span className="text-[13px]">{row.specialRequest || <span className="text-[#86868B]">—</span>}</span>
      ),
    },
    {
      key: "visaStatus",
      header: "Visa",
      render: (row: UserDocument) => {
        const statusMap: Record<string, "default" | "warning" | "success" | "primary"> = {
          not_started: "default",
          in_progress: "warning",
          approved: "success",
          not_required: "primary",
        };
        return row.visaStatus ? (
          <Badge variant={statusMap[row.visaStatus] ?? "default"}>
            {row.visaStatus.replace("_", " ")}
          </Badge>
        ) : (
          <span className="text-[#86868B]">—</span>
        );
      },
    },
    {
      key: "departureFlight",
      header: "Departure Flight",
      render: (row: UserDocument) => <FlightCell flight={row.departureFlight} />,
    },
    {
      key: "arrivalFlight",
      header: "Return Flight",
      render: (row: UserDocument) => <FlightCell flight={row.arrivalFlight} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={students}
      keyExtractor={(row) => row.id}
      onRowClick={onRowClick}
      emptyMessage="No students yet. Upload an Excel file to get started."
    />
  );
}
