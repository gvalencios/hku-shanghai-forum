"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
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
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-[15px] text-[#1D1D1F] outline-none transition-all",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2386868B%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat",
            error
              ? "border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10"
              : "border-[#D2D2D7] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-[#86868B]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[12px] text-[#FF3B30]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
