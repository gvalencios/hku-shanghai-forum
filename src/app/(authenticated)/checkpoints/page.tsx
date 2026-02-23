"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { getAllCheckpoints } from "@/lib/firestore/checkpoints";
import { getCheckinsByUser } from "@/lib/firestore/checkins";
import { CheckpointList } from "@/components/checkpoints/CheckpointList";
import { Spinner } from "@/components/ui/Spinner";
import type { Checkpoint, Checkin } from "@/lib/types/checkpoint";

export default function StudentCheckpointsPage() {
  const { uid } = useAuth();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!uid) return;
    try {
      const [cps, cis] = await Promise.all([
        getAllCheckpoints(),
        getCheckinsByUser(uid),
      ]);
      setCheckpoints(cps);
      setCheckins(cis);
    } catch (err) {
      console.error("Failed to load checkpoints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Checkpoints
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Track your trip progress step by step
        </p>
      </div>

      {uid && (
        <CheckpointList
          checkpoints={checkpoints}
          checkins={checkins}
          userId={uid}
          onCheckinComplete={loadData}
        />
      )}
    </div>
  );
}
