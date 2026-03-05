"use client";

import { useState } from "react";
import type { UserDocument } from "@/lib/types/user";
import { updateUserProfile } from "@/lib/firestore/users";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

interface ProfileEditFormProps {
  user: UserDocument;
  uid: string;
  onUpdate: (data: Partial<UserDocument>) => void;
}

/* ── Segmented control for a small set of options ── */
function SegmentedControl({
  value,
  onChange,
  options,
  cols = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  cols?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        cols === 2 && "grid-cols-2",
        cols === 4 && "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-11 rounded-xl border px-3 text-[14px] font-medium transition-all",
              active
                ? "border-[#007AFF] bg-[#007AFF] text-white shadow-sm"
                : "border-[#D2D2D7] bg-white text-[#3C3C43] hover:border-[#007AFF]/40 hover:bg-[#F5F5F7]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Labelled form row ── */
function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[13px] font-medium text-[#6E6E73]">{label}</span>
        {required && <span className="text-[11px] font-semibold text-[#FF3B30]">Required</span>}
        {hint && !required && (
          <span className="ml-auto text-[11px] text-[#86868B]">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Section header inside a card ── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#F0F0F5]" />
    </div>
  );
}

export function ProfileEditForm({ user, uid, onUpdate }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [flightTicketStatus, setFlightTicketStatus] = useState(user.flightTicketStatus ?? "");
  const [departureFlight, setDepartureFlight] = useState(
    user.departureFlight ?? { date: "", time: "", flightNumber: "" },
  );
  const [arrivalFlight, setArrivalFlight] = useState(
    user.arrivalFlight ?? { date: "", time: "", flightNumber: "" },
  );
  const [visaStatus, setVisaStatus] = useState(user.visaStatus ?? "");
  const [visaNotes, setVisaNotes] = useState(user.visaNotes ?? "");
  const [emergencyContact, setEmergencyContact] = useState(
    user.emergencyContact ?? { name: "", relationship: "", phone: "", email: "" },
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user.dietaryRestrictions ?? "");
  const [medicalConditions, setMedicalConditions] = useState(user.medicalConditions ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Partial<UserDocument> = {
        flightTicketStatus,
        departureFlight,
        arrivalFlight,
        visaStatus,
        visaNotes,
        emergencyContact,
        dietaryRestrictions,
        medicalConditions,
      };
      await updateUserProfile(uid, data);
      onUpdate(data);
      toast("Profile updated");
    } catch {
      toast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Accommodation ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Accommodation</h3>
            <Badge variant="default">Managed by TA</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Check-in</dt>
              <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">{user.accommodation?.checkInDate || "—"}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Check-out</dt>
              <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">{user.accommodation?.checkOutDate || "—"}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Room Type</dt>
              <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">
                {user.accommodation?.roomType
                  ? user.accommodation.roomType === "single" ? "Single" : "Double"
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Room Information</dt>
              <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">
                {user.accommodation?.roomInfo || <span className="text-[13px] italic text-[#86868B]">Room number will be confirmed during check-in.</span>}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-[#86868B]">Booking Confirmation Number</dt>
              <dd className="mt-0.5 text-[15px] text-[#1D1D1F]">{user.accommodation?.bookingConfirmation || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* ── Flight Information ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Flight Information</h3>
            <span className="rounded-full bg-[#FF3B30]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF3B30]">
              Complete Now
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Ticket status */}
          <FormField label="Ticket Status" required>
            <SegmentedControl
              value={flightTicketStatus}
              onChange={setFlightTicketStatus}
              options={[
                { value: "purchased", label: "Purchased" },
                { value: "not_purchased", label: "Not Purchased" },
              ]}
              cols={2}
            />
          </FormField>

          {/* Departure */}
          <SectionDivider label="Departure — HKG → PVG" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={departureFlight.date}
              onChange={(e) => setDepartureFlight({ ...departureFlight, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={departureFlight.time}
              onChange={(e) => setDepartureFlight({ ...departureFlight, time: e.target.value })}
            />
          </div>
          <Input
            label="Flight Number"
            placeholder="e.g. CX123"
            value={departureFlight.flightNumber}
            onChange={(e) => setDepartureFlight({ ...departureFlight, flightNumber: e.target.value })}
          />

          {/* Return */}
          <SectionDivider label="Return — PVG → HKG" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={arrivalFlight.date}
              onChange={(e) => setArrivalFlight({ ...arrivalFlight, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={arrivalFlight.time}
              onChange={(e) => setArrivalFlight({ ...arrivalFlight, time: e.target.value })}
            />
          </div>
          <Input
            label="Flight Number"
            placeholder="e.g. CX456"
            value={arrivalFlight.flightNumber}
            onChange={(e) => setArrivalFlight({ ...arrivalFlight, flightNumber: e.target.value })}
          />

        </CardContent>
      </Card>

      {/* ── Visa Information ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Visa Information</h3>
            <span className="rounded-full bg-[#FF3B30]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF3B30]">
              Complete Now
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Visa Status" required>
            <SegmentedControl
              value={visaStatus}
              onChange={setVisaStatus}
              options={[
                { value: "not_started", label: "Not Started" },
                { value: "in_progress", label: "In Progress" },
                { value: "approved", label: "Approved" },
                { value: "not_required", label: "Not Required" },
              ]}
              cols={4}
            />
          </FormField>
          <Textarea
            label="Visa Notes"
            placeholder="Any additional details..."
            value={visaNotes}
            onChange={(e) => setVisaNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* ── Emergency Contact ── */}
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Emergency Contact</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              value={emergencyContact.name}
              onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Parent"
              value={emergencyContact.relationship}
              onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              type="tel"
              value={emergencyContact.phone}
              onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={emergencyContact.email}
              onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Health & Dietary ── */}
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">Health & Dietary</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            label="Dietary Restrictions"
            placeholder="Leave blank if none"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
          />
          <Textarea
            label="Medical Conditions"
            placeholder="Leave blank if none"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
