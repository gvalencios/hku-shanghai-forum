"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllStudents } from "@/lib/firestore/users";
import { ExcelUpload } from "@/components/students/ExcelUpload";
import { StudentList } from "@/components/students/StudentList";
import { SearchBar } from "@/components/ui/SearchBar";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui";
import type { UserDocument } from "@/lib/types/user";
import ExcelJS from "exceljs";

export default function TAStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<(UserDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Students");

      sheet.columns = [
        { header: "Family Name", key: "familyNameEn", width: 16 },
        { header: "First Name", key: "firstNameEn", width: 16 },
        { header: "Chinese Name", key: "fullChineseName", width: 16 },
        { header: "Email", key: "email", width: 28 },
        { header: "Student ID", key: "studentId", width: 14 },
        { header: "Faculty", key: "faculty", width: 14 },
        { header: "Gender", key: "gender", width: 10 },
        { header: "Passport Country", key: "passportCountry", width: 18 },
        { header: "China Bank Account", key: "hasChinaBankAccount", width: 18 },
        { header: "Telephone", key: "telephone", width: 16 },
        { header: "Special Request", key: "specialRequest", width: 20 },
        { header: "Flight Ticket", key: "flightTicketStatus", width: 16 },
        { header: "Departure Date", key: "departureDate", width: 16 },
        { header: "Departure Time", key: "departureTime", width: 14 },
        { header: "Departure Flight No.", key: "departureFlightNumber", width: 20 },
        { header: "Return Date", key: "returnDate", width: 14 },
        { header: "Return Time", key: "returnTime", width: 14 },
        { header: "Return Flight No.", key: "returnFlightNumber", width: 18 },
        { header: "Visa Status", key: "visaStatus", width: 14 },
        { header: "Visa Notes", key: "visaNotes", width: 20 },
        { header: "Dietary Restrictions", key: "dietaryRestrictions", width: 20 },
        { header: "Medical Conditions", key: "medicalConditions", width: 20 },
        { header: "Emergency Name", key: "emergencyName", width: 18 },
        { header: "Emergency Relationship", key: "emergencyRelationship", width: 20 },
        { header: "Emergency Phone", key: "emergencyPhone", width: 16 },
        { header: "Emergency Email", key: "emergencyEmail", width: 24 },
      ];

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F7" },
      };

      for (const s of students) {
        sheet.addRow({
          familyNameEn: s.familyNameEn || "",
          firstNameEn: s.firstNameEn || "",
          fullChineseName: s.fullChineseName || "",
          email: s.email || s.id || "",
          studentId: s.studentId || "",
          faculty: s.faculty || "",
          gender: s.gender || "",
          passportCountry: s.passportCountry || "",
          hasChinaBankAccount: s.hasChinaBankAccount ? "Yes" : "No",
          telephone: s.telephone || "",
          specialRequest: s.specialRequest || "",
          flightTicketStatus: s.flightTicketStatus || "",
          departureDate: s.departureFlight?.date || "",
          departureTime: s.departureFlight?.time || "",
          departureFlightNumber: s.departureFlight?.flightNumber || "",
          returnDate: s.arrivalFlight?.date || "",
          returnTime: s.arrivalFlight?.time || "",
          returnFlightNumber: s.arrivalFlight?.flightNumber || "",
          visaStatus: s.visaStatus?.replace(/_/g, " ") || "",
          visaNotes: s.visaNotes || "",
          dietaryRestrictions: s.dietaryRestrictions || "",
          medicalConditions: s.medicalConditions || "",
          emergencyName: s.emergencyContact?.name || "",
          emergencyRelationship: s.emergencyContact?.relationship || "",
          emergencyPhone: s.emergencyContact?.phone || "",
          emergencyEmail: s.emergencyContact?.email || "",
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `Shanghai_Forum_Students_${date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setExporting(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.familyNameEn?.toLowerCase().includes(q) ||
      s.firstNameEn?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.faculty?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Students
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Manage student profiles and import from Excel
        </p>
      </div>

      <div className="space-y-6">
        <ExcelUpload onUploadComplete={loadStudents} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
              All Students ({students.length})
            </h2>
            <div className="flex items-center gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search students..."
                className="w-64"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={exportToExcel}
                disabled={exporting || students.length === 0}
              >
                {exporting ? "Exporting…" : "Export Excel"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <StudentList
              students={filtered}
              onRowClick={(s) => router.push(`/ta/students/${encodeURIComponent(s.id)}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
