"use client";

import type { UserDocument } from "@/lib/types/user";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ProfileViewProps {
  user: UserDocument;
}

function Field({ label, value }: { label: string; value: string | boolean }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—";
  return (
    <div>
      <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">{display}</dd>
    </div>
  );
}

export function ProfileView({ user }: ProfileViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
            University Information
          </h3>
          <Badge variant="default">Managed by TA</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Family Name" value={user.familyNameEn} />
          <Field label="First Name" value={user.firstNameEn} />
          <Field label="Chinese Name" value={user.fullChineseName} />
          <Field label="Gender" value={user.gender} />
          <Field label="Faculty" value={user.faculty} />
          <Field label="Student ID" value={user.studentId} />
          <Field label="Email" value={user.email} />
          <Field label="Passport Country" value={user.passportCountry} />
          <Field label="China Bank Account" value={user.hasChinaBankAccount} />
          <Field label="Telephone" value={user.telephone} />
          <Field label="Special Request" value={user.specialRequest} />
        </dl>
      </CardContent>
    </Card>
  );
}
