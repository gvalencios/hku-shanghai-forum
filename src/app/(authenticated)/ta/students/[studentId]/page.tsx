"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById, updateUserProfile } from "@/lib/firestore/users";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { UserDocument } from "@/lib/types/user";

interface EditableFields {
  familyNameEn: string;
  firstNameEn: string;
  fullChineseName: string;
  studentId: string;
  faculty: string;
  gender: string;
  telephone: string;
  passportCountry: string;
  hasChinaBankAccount: boolean;
  specialRequest: string;
}

function formatFlight(f?: { date?: string; time?: string; flightNumber?: string }): string | undefined {
  if (!f?.flightNumber) return undefined;
  const date = f.date
    ? new Date(f.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const time = f.time ?? null;
  const parts = [f.flightNumber];
  if (date) parts.push(`· ${date}`);
  if (time) parts.push(`· ${time}`);
  return parts.join(" ");
}

function Field({ label, value }: { label: string; value?: string | boolean | null }) {
  const display =
    value === true ? "Yes" :
    value === false ? "No" :
    value || null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">{label}</p>
      <p className="mt-0.5 text-[14px] text-[#1D1D1F]">
        {display ?? <span className="text-[#86868B]">—</span>}
      </p>
    </div>
  );
}

const visaVariant: Record<string, "default" | "warning" | "success" | "primary"> = {
  not_started: "default",
  in_progress: "warning",
  approved: "success",
  not_required: "primary",
};

function getEditableFields(s: UserDocument): EditableFields {
  return {
    familyNameEn: s.familyNameEn ?? "",
    firstNameEn: s.firstNameEn ?? "",
    fullChineseName: s.fullChineseName ?? "",
    studentId: s.studentId ?? "",
    faculty: s.faculty ?? "",
    gender: s.gender ?? "",
    telephone: s.telephone ?? "",
    passportCountry: s.passportCountry ?? "",
    hasChinaBankAccount: s.hasChinaBankAccount ?? false,
    specialRequest: s.specialRequest ?? "",
  };
}

export default function TAStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = decodeURIComponent(params.studentId as string);

  const [student, setStudent] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableFields | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserById(email).then((data) => {
      setStudent(data);
      setLoading(false);
    });
  }, [email]);

  function startEditing() {
    if (!student) return;
    setEditData(getEditableFields(student));
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditData(null);
    setIsEditing(false);
  }

  async function saveEdits() {
    if (!student || !editData) return;
    setSaving(true);
    try {
      await updateUserProfile(email, editData);
      setStudent({ ...student, ...editData });
      setIsEditing(false);
      setEditData(null);
      toast("Student info updated", "success");
    } catch {
      toast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setEditData((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!student) {
    return <div className="py-20 text-center text-[#86868B]">Student not found</div>;
  }

  const fullName = [student.familyNameEn, student.firstNameEn].filter(Boolean).join(" ");

  return (
    <div className="max-w-3xl">
      {/* Back + header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-[#6E6E73]" onClick={() => router.back()}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Students
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[20px] font-bold text-[#007AFF]">
            {student.familyNameEn?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
              {fullName || email}
            </h1>
            {student.fullChineseName && (
              <p className="text-[15px] text-[#86868B]">{student.fullChineseName}</p>
            )}
            <p className="mt-0.5 text-[13px] text-[#6E6E73]">{email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* University info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#86868B]">University Info</h2>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={startEditing} className="text-[#007AFF]">
                  <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing && editData ? (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Input label="Family Name" value={editData.familyNameEn} onChange={(e) => updateField("familyNameEn", e.target.value)} />
                  <Input label="First Name" value={editData.firstNameEn} onChange={(e) => updateField("firstNameEn", e.target.value)} />
                  <Input label="Chinese Name" value={editData.fullChineseName} onChange={(e) => updateField("fullChineseName", e.target.value)} />
                  <Input label="Student ID" value={editData.studentId} onChange={(e) => updateField("studentId", e.target.value)} />
                  <Input label="Faculty" value={editData.faculty} onChange={(e) => updateField("faculty", e.target.value)} />
                  <Select
                    label="Gender"
                    value={editData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    options={[{ value: "M", label: "Male" }, { value: "F", label: "Female" }]}
                    placeholder="Select"
                  />
                  <Input label="Telephone" value={editData.telephone} onChange={(e) => updateField("telephone", e.target.value)} />
                  <Input label="Passport Country" value={editData.passportCountry} onChange={(e) => updateField("passportCountry", e.target.value)} />
                  <Select
                    label="China Bank Account"
                    value={editData.hasChinaBankAccount ? "yes" : "no"}
                    onChange={(e) => updateField("hasChinaBankAccount", e.target.value === "yes")}
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                  />
                </div>
                <div className="mt-4 border-t border-[#F5F5F7] pt-4">
                  <Input label="Special Request" value={editData.specialRequest} onChange={(e) => updateField("specialRequest", e.target.value)} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={saveEdits} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Field label="Student ID" value={student.studentId} />
                  <Field label="Faculty" value={student.faculty} />
                  <Field label="Gender" value={student.gender} />
                  <Field label="Telephone" value={student.telephone} />
                  <Field label="Passport Country" value={student.passportCountry} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">China Bank Account</p>
                    <p className="mt-0.5 text-[14px]">
                      {student.hasChinaBankAccount
                        ? <span className="text-[#30D158]">Yes</span>
                        : <span className="text-[#86868B]">No</span>}
                    </p>
                  </div>
                </div>
                {student.specialRequest && (
                  <div className="mt-4 border-t border-[#F5F5F7] pt-4">
                    <Field label="Special Request" value={student.specialRequest} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Travel info */}
        <Card>
          <CardHeader>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#86868B]">Travel</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1: ticket + visa status */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Flight Ticket</p>
                <p className="mt-0.5 text-[14px]">
                  {student.flightTicketStatus === "purchased"
                    ? <span className="text-[#30D158]">Purchased</span>
                    : student.flightTicketStatus === "not_purchased"
                    ? <span className="text-[#FF3B30]">Not Purchased</span>
                    : <span className="text-[#86868B]">—</span>}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Visa Status</p>
                <div className="mt-1">
                  {student.visaStatus ? (
                    <Badge variant={visaVariant[student.visaStatus] ?? "default"}>
                      {student.visaStatus.replace(/_/g, " ")}
                    </Badge>
                  ) : (
                    <span className="text-[14px] text-[#86868B]">—</span>
                  )}
                </div>
              </div>
              {/* Row 2: flights */}
              <Field label="Departure Flight" value={formatFlight(student.departureFlight)} />
              <Field label="Return Flight" value={formatFlight(student.arrivalFlight)} />
            </div>
            {/* Visa notes only if filled */}
            {student.visaNotes && (
              <div className="mt-4 border-t border-[#F5F5F7] pt-4">
                <Field label="Visa Notes" value={student.visaNotes} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health info */}
        <Card>
          <CardHeader>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#86868B]">Health & Dietary</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              <Field label="Dietary Restrictions" value={student.dietaryRestrictions} />
              <Field label="Medical Conditions" value={student.medicalConditions} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency contact */}
        <Card>
          <CardHeader>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#86868B]">Emergency Contact</h2>
          </CardHeader>
          <CardContent>
            {student.emergencyContact?.name ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Name" value={student.emergencyContact.name} />
                <Field label="Relationship" value={student.emergencyContact.relationship} />
                <Field label="Phone" value={student.emergencyContact.phone} />
                <Field label="Email" value={student.emergencyContact.email} />
              </div>
            ) : (
              <p className="text-[14px] text-[#86868B]">No emergency contact provided</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
