"use client";

import { useState } from "react";
import type { Reply } from "@/lib/types/report";
import { addReply } from "@/lib/firestore/reports";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

interface ReplyThreadProps {
  reportId: string;
  replies: Reply[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "student" | "ta";
  onReplyAdded: () => void;
}

export function ReplyThread({
  reportId,
  replies,
  currentUserId,
  currentUserName,
  currentUserRole,
  onReplyAdded,
}: ReplyThreadProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      await addReply(reportId, {
        authorId: currentUserId,
        authorName: currentUserName,
        authorRole: currentUserRole,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      });
      setContent("");
      toast("Reply sent");
      onReplyAdded();
    } catch {
      toast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
        Replies ({replies.length})
      </h3>

      {replies.length === 0 && (
        <p className="py-4 text-center text-[14px] text-[#86868B]">
          No replies yet
        </p>
      )}

      <div className="space-y-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="rounded-xl border border-[#E8E8ED] bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[13px] font-medium text-[#1D1D1F]">
                  {reply.authorName}
                </span>
                <Badge variant={reply.authorRole === "ta" ? "primary" : "default"}>
                  {reply.authorRole.toUpperCase()}
                </Badge>
              </div>
              <span className="flex-shrink-0 text-[11px] text-[#86868B]">
                {new Date(reply.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#1D1D1F]">
              {reply.content}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button type="submit" loading={sending} disabled={!content.trim()}>
            Send Reply
          </Button>
        </div>
      </form>
    </div>
  );
}
