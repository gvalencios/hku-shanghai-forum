import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F7] text-[#86868B]">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-[17px] font-semibold text-[#1D1D1F]">{title}</h3>
      {description && (
        <p className="mb-5 max-w-sm text-[14px] leading-relaxed text-[#6E6E73]">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
