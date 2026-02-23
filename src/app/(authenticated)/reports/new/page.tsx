"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { createReport } from "@/lib/firestore/reports";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function NewReportPage() {
  const router = useRouter();
  const { email, uid } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      await createReport({
        title,
        description,
        studentId: uid,
        studentName: email ?? "Unknown",
        status: "open",
        importance: "low",
        contactPersonIds: [],
        createdAt: now,
        updatedAt: now,
      });
      toast("Report submitted");
      router.push("/reports");
    } catch {
      toast("Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          New Report
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Describe the issue or incident
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              required
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible..."
              required
              className="min-h-[150px]"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Report
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
