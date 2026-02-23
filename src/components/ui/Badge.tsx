import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "urgent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#F5F5F7] text-[#6E6E73]",
  primary: "bg-[#007AFF]/10 text-[#007AFF]",
  success: "bg-[#30D158]/10 text-[#228B22]",
  warning: "bg-[#FF9F0A]/10 text-[#CC7F08]",
  danger: "bg-[#FF3B30]/10 text-[#FF3B30]",
  urgent: "bg-[#FF2D55]/10 text-[#FF2D55]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
