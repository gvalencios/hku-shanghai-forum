"use client";

import { useState } from "react";
import type { UserDocument } from "@/lib/types/user";
import { updateUserProfile } from "@/lib/firestore/users";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ProfileEditFormProps {
  user: UserDocument;
  uid: string;
  onUpdate: (data: Partial<UserDocument>) => void;
}

export function ProfileEditForm({ user, uid, onUpdate }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [flightTicketStatus, setFlightTicketStatus] = useState(user.flightTicketStatus ?? "");
  const [departureFlight, setDepartureFlight] = useState(user.departureFlight ?? { date: "", time: "", flightNumber: "" });
  const [arrivalFlight, setArrivalFlight] = useState(user.arrivalFlight ?? { date: "", time: "", flightNumber: "" });
  const [visaStatus, setVisaStatus] = useState(user.visaStatus ?? "");
  const [visaNotes, setVisaNotes] = useState(user.visaNotes ?? "");
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact ?? { name: "", relationship: "", phone: "", email: "" });
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
    <div className="space-y-6">
      {/* Flights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
              Flight Information
            </h3>
            <span className="rounded-full border border-[#FF3B30] px-2 py-0.5 text-[11px] font-semibold text-[#FF3B30]">
              Complete Now
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Select
            label="Flight Ticket Status"
            value={flightTicketStatus}
            onChange={(e) => setFlightTicketStatus(e.target.value)}
            placeholder="Select status"
            options={[
              { value: "purchased", label: "Purchased" },
              { value: "not_purchased", label: "Not Purchased" },
            ]}
          />
          <div>
            <p className="mb-3 text-[13px] font-medium text-[#6E6E73]">Departure Flight</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Date" type="date" value={departureFlight.date} onChange={(e) => setDepartureFlight({ ...departureFlight, date: e.target.value })} />
              <Input label="Time" type="time" value={departureFlight.time} onChange={(e) => setDepartureFlight({ ...departureFlight, time: e.target.value })} />
              <Input label="Flight Number" placeholder="e.g. CX123" value={departureFlight.flightNumber} onChange={(e) => setDepartureFlight({ ...departureFlight, flightNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <p className="mb-3 text-[13px] font-medium text-[#6E6E73]">Return Flight</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Date" type="date" value={arrivalFlight.date} onChange={(e) => setArrivalFlight({ ...arrivalFlight, date: e.target.value })} />
              <Input label="Time" type="time" value={arrivalFlight.time} onChange={(e) => setArrivalFlight({ ...arrivalFlight, time: e.target.value })} />
              <Input label="Flight Number" placeholder="e.g. CX456" value={arrivalFlight.flightNumber} onChange={(e) => setArrivalFlight({ ...arrivalFlight, flightNumber: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
              Visa Information
            </h3>
            <span className="rounded-full border border-[#FF3B30] px-2 py-0.5 text-[11px] font-semibold text-[#FF3B30]">
              Complete Now
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            label="Visa Status"
            value={visaStatus}
            onChange={(e) => setVisaStatus(e.target.value)}
            placeholder="Select status"
            options={[
              { value: "not_started", label: "Not Started" },
              { value: "in_progress", label: "In Progress" },
              { value: "approved", label: "Approved" },
              { value: "not_required", label: "Not Required" },
            ]}
          />
          <Textarea label="Visa Notes" placeholder="Any additional details..." value={visaNotes} onChange={(e) => setVisaNotes(e.target.value)} />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
            Emergency Contact
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Name" value={emergencyContact.name} onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })} />
            <Input label="Relationship" placeholder="e.g. Parent" value={emergencyContact.relationship} onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })} />
            <Input label="Phone" type="tel" value={emergencyContact.phone} onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} />
            <Input label="Email" type="email" value={emergencyContact.email} onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Health */}
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
            Health & Dietary
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea label="Dietary Restrictions" placeholder="Leave blank if none" value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
          <Textarea label="Medical Conditions" placeholder="Leave blank if none" value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} />
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
