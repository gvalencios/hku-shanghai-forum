"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllStudents, createStudent, deleteStudent } from "@/lib/firestore/users";
import { ExcelUpload } from "@/components/students/ExcelUpload";
import { StudentList } from "@/components/students/StudentList";
import { SearchBar } from "@/components/ui/SearchBar";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import type { UserDocument } from "@/lib/types/user";
import ExcelJS from "exceljs";

export default function TAStudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<(UserDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Modal states
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  // Add student form
  const [addData, setAddData] = useState({
    email: "",
    familyNameEn: "",
    firstNameEn: "",
    fullChineseName: "",
    studentId: "",
    faculty: "",
    gender: "",
    telephone: "",
    passportCountry: "",
    hasChinaBankAccount: false,
    specialRequest: "",
  });
  const [addSaving, setAddSaving] = useState(false);

  // Remove student
  const [removeSearch, setRemoveSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<(UserDocument & { id: string }) | null>(null);
  const [removing, setRemoving] = useState(false);

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

  // Remove modal: filter students by search
  const removeFiltered = students.filter((s) => {
    if (!removeSearch) return true;
    const q = removeSearch.toLowerCase();
    return (
      s.familyNameEn?.toLowerCase().includes(q) ||
      s.firstNameEn?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q)
    );
  });

  async function handleAddStudent() {
    if (!addData.email || !addData.email.includes("@")) {
      toast("Please enter a valid email", "error");
      return;
    }
    setAddSaving(true);
    try {
      await createStudent(addData.email, {
        familyNameEn: addData.familyNameEn,
        firstNameEn: addData.firstNameEn,
        fullChineseName: addData.fullChineseName,
        studentId: addData.studentId,
        faculty: addData.faculty,
        gender: addData.gender,
        telephone: addData.telephone,
        passportCountry: addData.passportCountry,
        hasChinaBankAccount: addData.hasChinaBankAccount,
        specialRequest: addData.specialRequest,
      });
      toast("Student added");
      setShowAdd(false);
      setAddData({
        email: "", familyNameEn: "", firstNameEn: "", fullChineseName: "",
        studentId: "", faculty: "", gender: "", telephone: "",
        passportCountry: "", hasChinaBankAccount: false, specialRequest: "",
      });
      loadStudents();
    } catch {
      toast("Failed to add student", "error");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleRemoveStudent() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await deleteStudent(removeTarget.id);
      toast("Student removed");
      setShowRemove(false);
      setRemoveTarget(null);
      setRemoveSearch("");
      loadStudents();
    } catch {
      toast("Failed to remove student", "error");
    } finally {
      setRemoving(false);
    }
  }

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

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="primary" size="md" onClick={() => setShowAdd(true)} className="w-full">
            Add Student
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShowRemove(true)} disabled={students.length === 0} className="w-full">
            Remove Student
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShowImport(true)} className="w-full">
            Import Excel
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={exportToExcel}
            disabled={exporting || students.length === 0}
            className="w-full"
          >
            {exporting ? "Exporting\u2026" : "Export Excel"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
            All Students ({students.length})
          </h2>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search students..."
            className="w-64"
          />
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

      {/* Import Excel Modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Student List" size="lg">
        <ExcelUpload onUploadComplete={() => { setShowImport(false); loadStudents(); }} />
      </Modal>

      {/* Add Student Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Student" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="u1234567@connect.hku.hk" value={addData.email} onChange={(e) => setAddData({ ...addData, email: e.target.value })} />
            <Input label="Student ID" value={addData.studentId} onChange={(e) => setAddData({ ...addData, studentId: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Family Name" value={addData.familyNameEn} onChange={(e) => setAddData({ ...addData, familyNameEn: e.target.value })} />
            <Input label="First Name" value={addData.firstNameEn} onChange={(e) => setAddData({ ...addData, firstNameEn: e.target.value })} />
            <Input label="Chinese Name" value={addData.fullChineseName} onChange={(e) => setAddData({ ...addData, fullChineseName: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Faculty" value={addData.faculty} onChange={(e) => setAddData({ ...addData, faculty: e.target.value })} />
            <Select
              label="Gender"
              value={addData.gender}
              onChange={(e) => setAddData({ ...addData, gender: e.target.value })}
              options={[{ value: "M", label: "Male" }, { value: "F", label: "Female" }]}
              placeholder="Select"
            />
            <Input label="Telephone" value={addData.telephone} onChange={(e) => setAddData({ ...addData, telephone: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Passport Country" value={addData.passportCountry} onChange={(e) => setAddData({ ...addData, passportCountry: e.target.value })} />
            <Select
              label="China Bank Account"
              value={addData.hasChinaBankAccount ? "yes" : "no"}
              onChange={(e) => setAddData({ ...addData, hasChinaBankAccount: e.target.value === "yes" })}
              options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
            />
            <Input label="Special Request" value={addData.specialRequest} onChange={(e) => setAddData({ ...addData, specialRequest: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddStudent} loading={addSaving}>Add Student</Button>
          </div>
        </div>
      </Modal>

      {/* Remove Student Modal */}
      <Modal open={showRemove} onClose={() => { setShowRemove(false); setRemoveTarget(null); setRemoveSearch(""); }} title="Remove Student" size="md">
        {removeTarget ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/5 p-4">
              <p className="text-[14px] text-[#1D1D1F]">
                Are you sure you want to remove <strong>{removeTarget.familyNameEn} {removeTarget.firstNameEn}</strong>?
              </p>
              <p className="mt-1 text-[12px] text-[#86868B]">
                {removeTarget.email} &middot; {removeTarget.studentId}
              </p>
              <p className="mt-2 text-[12px] text-[#FF3B30]">
                This will permanently delete their profile and all associated data.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRemoveTarget(null)}>Back</Button>
              <Button variant="danger" size="sm" onClick={handleRemoveStudent} loading={removing}>Remove</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Search by name, email, or student ID..."
              value={removeSearch}
              onChange={(e) => setRemoveSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-auto rounded-xl border border-[#E8E8ED]">
              {removeFiltered.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-[#86868B]">No students found</p>
              ) : (
                <ul className="divide-y divide-[#E8E8ED]">
                  {removeFiltered.slice(0, 20).map((s) => (
                    <li
                      key={s.id}
                      className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-[#F5F5F7]"
                      onClick={() => setRemoveTarget(s)}
                    >
                      <div>
                        <p className="text-[14px] font-medium text-[#1D1D1F]">
                          {s.familyNameEn} {s.firstNameEn}
                        </p>
                        <p className="text-[12px] text-[#86868B]">{s.email}</p>
                      </div>
                      <span className="text-[12px] text-[#86868B]">{s.studentId}</span>
                    </li>
                  ))}
                  {removeFiltered.length > 20 && (
                    <li className="px-4 py-2 text-center text-[12px] text-[#86868B]">
                      {removeFiltered.length - 20} more — refine your search
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
