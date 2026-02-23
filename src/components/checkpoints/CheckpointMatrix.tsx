"use client";

import type { Checkpoint, Checkin } from "@/lib/types/checkpoint";
import type { UserDocument } from "@/lib/types/user";
import { cn } from "@/lib/utils/cn";

interface CheckpointMatrixProps {
  students: (UserDocument & { id: string })[];
  checkpoints: Checkpoint[];
  checkins: Checkin[];
}

export function CheckpointMatrix({
  students,
  checkpoints,
  checkins,
}: CheckpointMatrixProps) {
  const checkinMap = new Map<string, boolean>();
  checkins.forEach((ci) => {
    checkinMap.set(`${ci.userId}:${ci.checkpointId}`, true);
  });

  const completionCounts = checkpoints.map((cp) => {
    return students.filter((s) => checkinMap.has(`${s.id}:${cp.id}`)).length;
  });

  if (students.length === 0 || checkpoints.length === 0) {
    return (
      <div className="py-12 text-center text-[15px] text-[#86868B]">
        No data to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E8E8ED]">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
          <tr>
            <th className="sticky left-0 z-20 bg-[#FAFAFA] px-3 py-2.5 text-left font-semibold text-[#86868B] min-w-[160px]">
              Student
            </th>
            {checkpoints.map((cp) => (
              <th
                key={cp.id}
                className="px-2 py-2.5 text-center font-semibold text-[#86868B] min-w-[40px]"
                title={cp.name}
              >
                <span className="block max-w-[60px] truncate">{cp.order}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E8ED]">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-[#F5F5F7]">
              <td className="sticky left-0 bg-white px-3 py-2 font-medium text-[#1D1D1F] min-w-[160px] border-r border-[#E8E8ED]">
                {student.familyNameEn} {student.firstNameEn}
              </td>
              {checkpoints.map((cp) => {
                const done = checkinMap.has(`${student.id}:${cp.id}`);
                return (
                  <td key={cp.id} className="px-2 py-2 text-center">
                    <div
                      className={cn(
                        "mx-auto flex h-6 w-6 items-center justify-center rounded-full",
                        done
                          ? "bg-[#30D158] text-white"
                          : "bg-[#F5F5F7] text-[#D2D2D7]"
                      )}
                    >
                      {done ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-[9px]">—</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Summary row */}
          <tr className="bg-[#FAFAFA] font-semibold">
            <td className="sticky left-0 bg-[#FAFAFA] px-3 py-2 text-[#6E6E73] border-r border-[#E8E8ED]">
              Total ({students.length})
            </td>
            {completionCounts.map((count, i) => (
              <td key={i} className="px-2 py-2 text-center text-[#6E6E73]">
                {count}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
