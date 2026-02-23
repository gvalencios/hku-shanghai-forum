"use client";

import { useState } from "react";
import type { Checkpoint, Checkin, CheckpointCategory } from "@/lib/types/checkpoint";
import { CATEGORY_LABELS } from "@/lib/types/checkpoint";
import { createCheckin, deleteCheckin } from "@/lib/firestore/checkins";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

interface CheckpointListProps {
  checkpoints: Checkpoint[];
  checkins: Checkin[];
  userId: string;
  onCheckinComplete: () => void;
}

export function CheckpointList({
  checkpoints,
  checkins,
  userId,
  onCheckinComplete,
}: CheckpointListProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const grouped = checkpoints.reduce<Record<CheckpointCategory, Checkpoint[]>>(
    (acc, cp) => {
      if (!acc[cp.category]) acc[cp.category] = [];
      acc[cp.category].push(cp);
      return acc;
    },
    {} as Record<CheckpointCategory, Checkpoint[]>
  );

  const isCheckedIn = (cpId: string, recurringDate?: string) => {
    return checkins.some(
      (ci) =>
        ci.checkpointId === cpId &&
        (!recurringDate || ci.recurringDate === recurringDate)
    );
  };

  const handleCheckin = async (checkpoint: Checkpoint) => {
    const today = new Date().toISOString().split("T")[0];
    const recurringDate = checkpoint.isRecurring ? today : undefined;

    // Check for duplicate using already-loaded in-memory checkins
    if (isCheckedIn(checkpoint.id, recurringDate)) {
      toast("Already checked in", "info");
      return;
    }

    setLoadingId(checkpoint.id);
    try {
      await createCheckin({
        checkpointId: checkpoint.id,
        userId,
        timestamp: new Date().toISOString(),
        note: "",
        ...(recurringDate ? { recurringDate } : {}),
      });
      toast(`Checked in: ${checkpoint.name}`);
      onCheckinComplete();
    } catch {
      toast("Failed to check in", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUncheck = async (checkpoint: Checkpoint) => {
    const today = new Date().toISOString().split("T")[0];
    const recurringDate = checkpoint.isRecurring ? today : undefined;
    const checkin = checkins.find(
      (ci) =>
        ci.checkpointId === checkpoint.id &&
        (!recurringDate || ci.recurringDate === recurringDate)
    );
    if (!checkin) return;
    setUndoingId(checkpoint.id);
    try {
      await deleteCheckin(checkin.id);
      onCheckinComplete();
    } catch {
      toast("Failed to undo check-in", "error");
    } finally {
      setUndoingId(null);
    }
  };

  const categories = Object.keys(CATEGORY_LABELS) as CheckpointCategory[];

  return (
    <div className="space-y-8">
      {categories.map((cat) => {
        const items = grouped[cat];
        if (!items?.length) return null;

        return (
          <div key={cat}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[#86868B]">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="space-y-2">
              {items.map((cp) => {
                const today = new Date().toISOString().split("T")[0];
                const done = isCheckedIn(cp.id, cp.isRecurring ? today : undefined);

                return (
                  <Card key={cp.id} className={cn(done && "border-[#30D158]/30 bg-[#30D158]/[0.02]")}>
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        done ? "bg-[#30D158] text-white" : "bg-[#F5F5F7] text-[#86868B]"
                      )}>
                        {done ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="text-[12px] font-bold">{cp.order}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[14px] font-medium", done ? "text-[#30D158]" : "text-[#1D1D1F]")}>
                          {cp.name}
                        </p>
                        {cp.description && (
                          <p className="text-[12px] text-[#86868B]">{cp.description}</p>
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {cp.isRecurring && <Badge variant="primary">Daily</Badge>}
                        {done ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#86868B]"
                            onClick={() => handleUncheck(cp)}
                            loading={undoingId === cp.id}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCheckin(cp)}
                            loading={loadingId === cp.id}
                          >
                            Check in
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
