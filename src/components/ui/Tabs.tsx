"use client";

import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl bg-[#F5F5F7] p-1", className)}>
      <div className="flex min-w-max gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
            activeTab === tab.id
              ? "bg-white text-[#1D1D1F] shadow-sm"
              : "text-[#6E6E73] hover:text-[#1D1D1F]"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                activeTab === tab.id
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-[#E8E8ED] text-[#86868B]"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
      </div>
    </div>
  );
}
