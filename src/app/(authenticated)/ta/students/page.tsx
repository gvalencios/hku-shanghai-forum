"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllStudents } from "@/lib/firestore/users";
import { ExcelUpload } from "@/components/students/ExcelUpload";
import { StudentList } from "@/components/students/StudentList";
import { SearchBar } from "@/components/ui/SearchBar";
import { Spinner } from "@/components/ui/Spinner";
import type { UserDocument } from "@/lib/types/user";

export default function TAStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<(UserDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      </div>
    </div>
  );
}
