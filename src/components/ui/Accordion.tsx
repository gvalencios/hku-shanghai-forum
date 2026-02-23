"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
}

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn("divide-y divide-[#E8E8ED] rounded-2xl border border-[#E8E8ED] bg-white overflow-hidden", className)}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
            >
              <span className="text-[15px] font-medium text-[#1D1D1F]">
                {item.title}
              </span>
              <svg
                className={cn(
                  "h-4 w-4 text-[#86868B] transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isOpen && (
              <div className="border-t border-[#E8E8ED] bg-[#FAFAFA] px-5 py-4 text-[14px] leading-relaxed text-[#6E6E73]">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
