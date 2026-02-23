import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E8E8ED] bg-white",
        elevated
          ? "shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          : "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-[#E8E8ED] px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-[#E8E8ED] px-5 py-3", className)}
      {...props}
    />
  );
}
