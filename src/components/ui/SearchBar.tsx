"use client";

import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] pl-9 pr-3.5 text-[14px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B] focus:border-[#007AFF] focus:bg-white focus:ring-4 focus:ring-[#007AFF]/10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#86868B] text-white"
        >
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
