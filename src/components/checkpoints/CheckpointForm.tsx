"use client";

import { useState } from "react";
import type { Checkpoint, CheckpointCategory } from "@/lib/types/checkpoint";
import { CATEGORY_LABELS } from "@/lib/types/checkpoint";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface CheckpointFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Checkpoint, "id">) => Promise<void>;
  initial?: Checkpoint;
  nextOrder: number;
  createdBy: string;
}

export function CheckpointForm({
  open,
  onClose,
  onSubmit,
  initial,
  nextOrder,
  createdBy,
}: CheckpointFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<CheckpointCategory>(initial?.category ?? "pre_departure");
  const [order, setOrder] = useState(initial?.order ?? nextOrder);
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        expectedTime: "",
        order,
        category,
        isRecurring,
        createdBy,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Checkpoint" : "New Checkpoint"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Boarded departure flight"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CheckpointCategory)}
            options={categoryOptions}
          />
          <Input
            label="Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
          />
        </div>
        <label className="flex items-center gap-2 text-[14px] text-[#1D1D1F]">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-[#D2D2D7] text-[#007AFF] focus:ring-[#007AFF]"
          />
          Recurring (daily check-in)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {initial ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
