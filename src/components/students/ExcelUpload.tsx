"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { ParsedStudent, ParseError } from "@/lib/excel/parse-students";

interface DeletedStudent {
  email: string;
  familyNameEn?: string;
  firstNameEn?: string;
  studentId?: string;
  faculty?: string;
}

interface ExcelUploadProps {
  onUploadComplete: () => void;
}

export function ExcelUpload({ onUploadComplete }: ExcelUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedStudent[] | null>(null);
  const [toDelete, setToDelete] = useState<DeletedStudent[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrors([]);
    setPreview(null);
    setToDelete([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/upload-students", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.preview) {
        setPreview(data.students);
        setToDelete(data.toDelete || []);
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

      const res = await fetch("/api/admin/upload-students", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.imported !== undefined) {
        const parts = [`Imported ${data.imported} students`];
        if (data.deleted > 0) parts.push(`deleted ${data.deleted}`);
        toast(parts.join(", "));
        setPreview(null);
        setToDelete([]);
        setFile(null);
        setErrors([]);
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
  const totalRows = (preview?.length ?? 0) + toDelete.length;

  return (
    <div className="space-y-4">
      <FileUpload
        accept=".xlsx,.xls"
        onFileSelect={handleFileSelect}
        label="Upload Student List"
        hint="Excel file (.xlsx) with student data"
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
                Preview — {totalRows} change{totalRows !== 1 ? "s" : ""}
              </p>
              {toDelete.length > 0 && (
                <p className="text-[12px] text-[#FF3B30]">
                  {toDelete.length} student{toDelete.length !== 1 ? "s" : ""} will be permanently deleted
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setToDelete([]);
                  setFile(null);
                }}
              >
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
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Student ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Faculty</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#86868B]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8ED]">
                {/* Students to be deleted */}
                {toDelete.map((s, i) => (
                  <tr key={`del-${i}`} className="bg-[#FF3B30]/5">
                    <td className="px-3 py-2 text-[#1D1D1F] line-through opacity-50">
                      {s.familyNameEn} {s.firstNameEn}
                    </td>
                    <td className="px-3 py-2 text-[#6E6E73] line-through opacity-50">{s.email}</td>
                    <td className="px-3 py-2 text-[#6E6E73] line-through opacity-50">{s.studentId}</td>
                    <td className="px-3 py-2 text-[#6E6E73] line-through opacity-50">{s.faculty}</td>
                    <td className="px-3 py-2">
                      <Badge variant="danger">Delete</Badge>
                    </td>
                  </tr>
                ))}
                {/* Students from Excel */}
                {preview!.map((s, i) => {
                  const rowErrors = errors.filter((e) => e.row === i + 2);
                  return (
                    <tr key={i} className={rowErrors.length > 0 ? "bg-[#FF3B30]/5" : ""}>
                      <td className="px-3 py-2 text-[#1D1D1F]">
                        {s.familyNameEn} {s.firstNameEn}
                      </td>
                      <td className="px-3 py-2 text-[#6E6E73]">{s.email}</td>
                      <td className="px-3 py-2 text-[#6E6E73]">{s.studentId}</td>
                      <td className="px-3 py-2 text-[#6E6E73]">{s.faculty}</td>
                      <td className="px-3 py-2">
                        {rowErrors.length > 0 ? (
                          <Badge variant="danger">Error</Badge>
                        ) : (
                          <Badge variant="success">Valid</Badge>
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
