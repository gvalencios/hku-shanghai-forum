"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[13px] font-medium text-[#6E6E73]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "min-h-[100px] w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B] resize-y",
            error
              ? "border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10"
              : "border-[#D2D2D7] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[#FF3B30]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
