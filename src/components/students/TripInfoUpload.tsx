"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { ParsedTripInfo, TripInfoParseError } from "@/lib/excel/parse-trip-info";

const VISA_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  approved: "Approved",
  not_required: "Not Required",
};

interface TripInfoUploadProps {
  onUploadComplete: () => void;
}

export function TripInfoUpload({ onUploadComplete }: TripInfoUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedTripInfo[] | null>(null);
  const [notFound, setNotFound] = useState<string[]>([]);
  const [errors, setErrors] = useState<TripInfoParseError[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    setPreview(null);
    setNotFound([]);
    setFile(null);
    setErrors([]);
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrors([]);
    setPreview(null);
    setNotFound([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/upload-trip-info", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.preview) {
        setPreview(data.rows);
        setNotFound(data.notFound || []);
        setErrors(data.errors || []);
      } else if (data.errors?.length) {
        setErrors(data.errors);
      }
    } catch {
      toast("Failed to parse file", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setConfirming(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("confirm", "true");

      const res = await fetch("/api/admin/upload-trip-info", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.imported !== undefined) {
        const parts = [`Updated trip info for ${data.imported} students`];
        if (data.skipped > 0) parts.push(`${data.skipped} skipped (not found)`);
        toast(parts.join(", "));
        reset();
        onUploadComplete();
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    } finally {
      setConfirming(false);
    }
  };

  const hasPreview = preview && preview.length > 0;

  return (
    <div className="space-y-4">
      <FileUpload
        accept=".xlsx,.xls"
        onFileSelect={handleFileSelect}
        label="Upload Trip Info"
        hint="Excel (.xlsx) keyed by HKU email. Optional columns: flights + visa status. Updates existing students only — never adds or deletes."
      />

      {loading && (
        <div className="flex items-center gap-2 text-[14px] text-[#6E6E73]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#007AFF] border-t-transparent" />
          Parsing file...
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/5 p-4">
          <p className="mb-2 text-[13px] font-semibold text-[#FF3B30]">
            Validation Errors
          </p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-[13px] text-[#FF3B30]">
                Row {err.row}: {err.field} — {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasPreview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#1D1D1F]">
                Preview — {preview!.length} student{preview!.length !== 1 ? "s" : ""}
              </p>
              {notFound.length > 0 && (
                <p className="text-[12px] text-[#FF9500]">
                  {notFound.length} email{notFound.length !== 1 ? "s" : ""} not in system — will be skipped
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirm} loading={confirming}>
                Confirm Import
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-auto rounded-xl border border-[#E8E8ED]">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-[#FAFAFA]">
                <tr className="border-b border-[#E8E8ED]">
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Departure (HKG→PVG)</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Return (PVG→HKG)</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Visa</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8ED]">
                {preview!.map((r, i) => {
                  const skipped = notFound.includes(r.email);
                  const dep = [r.departureFlight.flightNumber, r.departureFlight.date, r.departureFlight.time]
                    .filter(Boolean).join(" · ");
                  const ret = [r.arrivalFlight.flightNumber, r.arrivalFlight.date, r.arrivalFlight.time]
                    .filter(Boolean).join(" · ");
                  return (
                    <tr key={i} className={skipped ? "bg-[#FF9500]/5" : ""}>
                      <td className={`px-3 py-2 ${skipped ? "text-[#86868B] line-through" : "text-[#1D1D1F]"}`}>
                        {r.email}
                      </td>
                      <td className="px-3 py-2 text-[#6E6E73]">{dep || "—"}</td>
                      <td className="px-3 py-2 text-[#6E6E73]">{ret || "—"}</td>
                      <td className="px-3 py-2 text-[#6E6E73]">{r.visaStatus ? VISA_LABELS[r.visaStatus] : "—"}</td>
                      <td className="px-3 py-2">
                        {skipped ? (
                          <Badge variant="warning">Skip</Badge>
                        ) : (
                          <Badge variant="success">Update</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
