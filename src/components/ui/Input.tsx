"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B]",
            error
              ? "border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10"
              : "border-[#D2D2D7] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[#FF3B30]">{error}</p>}
        {hint && !error && <p className="text-[12px] text-[#86868B]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
