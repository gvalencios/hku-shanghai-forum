"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { getAllCheckpoints, createCheckpoint, updateCheckpoint, deleteCheckpoint, batchUpdateCheckpointOrders } from "@/lib/firestore/checkpoints";
import { getAllCheckins } from "@/lib/firestore/checkins";
import { getAllStudents } from "@/lib/firestore/users";
import { DEFAULT_CHECKPOINTS, CATEGORY_LABELS } from "@/lib/types/checkpoint";
import { CheckpointMatrix } from "@/components/checkpoints/CheckpointMatrix";
import { CheckpointForm } from "@/components/checkpoints/CheckpointForm";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Tabs } from "@/components/ui/Tabs";
import type { Checkpoint, Checkin, CheckpointCategory } from "@/lib/types/checkpoint";
import type { UserDocument } from "@/lib/types/user";
import ExcelJS from "exceljs";

const CATEGORY_COLORS: Record<CheckpointCategory, string> = {
  pre_departure: "bg-[#BF5AF2]/10 text-[#BF5AF2]",
  day_of:        "bg-[#FF9F0A]/10 text-[#CC7F08]",
  arrival:       "bg-[#30D158]/10 text-[#228B22]",
  during_trip:   "bg-[#007AFF]/10 text-[#007AFF]",
  return:        "bg-[#FF6B00]/10 text-[#FF6B00]",
};

export default function TACheckpointsPage() {
  const { uid } = useAuth();
  const { toast } = useToast();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [students, setStudents] = useState<(UserDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCp, setEditingCp] = useState<Checkpoint | undefined>();
  const [tab, setTab] = useState("matrix");
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const checkinMap = new Map<string, boolean>();
      checkins.forEach((ci) => {
        checkinMap.set(`${ci.userId}:${ci.checkpointId}`, true);
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Checkpoints");

      sheet.columns = [
        { header: "Student", key: "student", width: 28 },
        ...checkpoints.map((cp) => ({
          header: `${cp.order}. ${cp.name}`,
          key: cp.id,
          width: 16,
        })),
      ];

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FFF2F2F7" },
      };

      // Student rows
      for (const s of students) {
        const row: Record<string, string> = {
          student: `${s.familyNameEn || ""} ${s.firstNameEn || ""}`.trim(),
        };
        for (const cp of checkpoints) {
          row[cp.id] = checkinMap.has(`${s.id}:${cp.id}`) ? "Yes" : "No";
        }
        sheet.addRow(row);
      }

      // Summary row
      const summaryRow: Record<string, string> = {
        student: `Total (${students.length})`,
      };
      for (const cp of checkpoints) {
        const count = students.filter((s) => checkinMap.has(`${s.id}:${cp.id}`)).length;
        summaryRow[cp.id] = `${count}/${students.length}`;
      }
      const totalRow = sheet.addRow(summaryRow);
      totalRow.font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `Shanghai_Forum_Checkpoints_${date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export checkpoints:", err);
    } finally {
      setExporting(false);
    }
  };

  const loadData = async () => {
    try {
      const [cps, cis, studs] = await Promise.all([
        getAllCheckpoints(),
        getAllCheckins(),
        getAllStudents(),
      ]);

      // Auto-fix order if it doesn't start from 1 or has gaps
      const needsFix = cps.some((cp, i) => cp.order !== i + 1);
      if (needsFix && cps.length > 0) {
        const fixes = cps.map((cp, i) => ({ id: cp.id, order: i + 1 }));
        await batchUpdateCheckpointOrders(fixes);
        cps.forEach((cp, i) => { cp.order = i + 1; });
      }

      setCheckpoints(cps);
      setCheckins(cis);
      setStudents(studs);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDefaults = async () => {
    if (!uid) return;
    try {
      for (const cp of DEFAULT_CHECKPOINTS) {
        await createCheckpoint({ ...cp, createdBy: uid });
      }
      toast("Default checkpoints created");
      loadData();
    } catch {
      toast("Failed to seed checkpoints", "error");
    }
  };

  const handleCreate = async (data: Omit<Checkpoint, "id">) => {
    const targetOrder = data.order;
    const conflicts = checkpoints.filter((cp) => cp.order >= targetOrder);
    if (conflicts.length > 0) {
      await batchUpdateCheckpointOrders(
        conflicts.map((cp) => ({ id: cp.id, order: cp.order + 1 }))
      );
    }
    await createCheckpoint(data);
    toast("Checkpoint created");
    loadData();
  };

  const handleUpdate = async (data: Omit<Checkpoint, "id">) => {
    if (!editingCp) return;
    const oldOrder = editingCp.order;
    const newOrder = data.order;

    if (oldOrder !== newOrder) {
      // Build new ordered list: remove edited cp, insert at new position, renumber
      const others = checkpoints
        .filter((cp) => cp.id !== editingCp.id)
        .sort((a, b) => a.order - b.order);
      // Clamp newOrder to valid range
      const clampedOrder = Math.max(1, Math.min(newOrder, others.length + 1));
      const insertIndex = clampedOrder - 1;
      others.splice(insertIndex, 0, { ...editingCp, order: clampedOrder });
      const shifts = others
        .map((cp, i) => ({ id: cp.id, order: i + 1 }))
        .filter((u) => {
          const existing = checkpoints.find((cp) => cp.id === u.id);
          return existing && existing.order !== u.order;
        });
      if (shifts.length > 0) {
        await batchUpdateCheckpointOrders(shifts);
      }
      data = { ...data, order: clampedOrder };
    }

    await updateCheckpoint(editingCp.id, data);
    toast("Checkpoint updated");
    setEditingCp(undefined);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteCheckpoint(id);
    // Renumber remaining checkpoints sequentially from 1
    const remaining = checkpoints
      .filter((cp) => cp.id !== id)
      .sort((a, b) => a.order - b.order);
    const shifts = remaining
      .map((cp, i) => ({ id: cp.id, order: i + 1 }))
      .filter((u) => checkpoints.find((cp) => cp.id === u.id)?.order !== u.order);
    if (shifts.length > 0) {
      await batchUpdateCheckpointOrders(shifts);
    }
    toast("Checkpoint deleted");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            Checkpoints
          </h1>
          <p className="mt-1 text-[15px] text-[#6E6E73]">
            Manage checkpoints and track student progress
          </p>
        </div>
        <div className="flex gap-2">
          {checkpoints.length === 0 && (
            <Button variant="secondary" onClick={handleSeedDefaults}>
              Load Defaults
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={exportToExcel}
            disabled={exporting || students.length === 0}
          >
            {exporting ? "Exporting…" : "Export Excel"}
          </Button>
          <Button onClick={() => { setEditingCp(undefined); setShowForm(true); }}>
            Add Checkpoint
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "matrix", label: "Matrix View" },
          { id: "manage", label: "Manage", count: checkpoints.length },
        ]}
        activeTab={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === "matrix" ? (
        <CheckpointMatrix
          students={students}
          checkpoints={checkpoints}
          checkins={checkins}
        />
      ) : (
        <div className="space-y-2">
          {checkpoints.map((cp) => (
            <Card key={cp.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[12px] font-bold text-[#6E6E73]">
                    {cp.order}
                  </span>
                  <div>
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_COLORS[cp.category]}`}>
                        {CATEGORY_LABELS[cp.category]}
                      </span>
                      {cp.isRecurring && <Badge variant="primary">Daily</Badge>}
                    </div>
                    <p className="text-[14px] font-medium text-[#1D1D1F]">{cp.name}</p>
                    {cp.description && <p className="text-[12px] text-[#86868B]">{cp.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingCp(cp); setShowForm(true); }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cp.id)}
                    className="text-[#FF3B30]"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && uid && (
        <CheckpointForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditingCp(undefined); }}
          onSubmit={editingCp ? handleUpdate : handleCreate}
          initial={editingCp}
          nextOrder={checkpoints.length + 1}
          createdBy={uid}
        />
      )}
    </div>
  );
}
