"use client";

import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data",
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[15px] text-[#86868B]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-[#E8E8ED]", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E8E8ED] bg-[#FAFAFA]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#86868B]",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E8ED]">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "group bg-white transition-colors",
                onRowClick && "cursor-pointer hover:bg-[#F5F5F7]"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-[14px] text-[#1D1D1F]",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : (row[col.key] as React.ReactNode) ?? "—"}
                </td>
              ))}
              {onRowClick && (
                <td className="w-8 pr-3 text-right">
                  <svg
                    className="ml-auto h-4 w-4 text-[#C7C7CC] opacity-0 transition-opacity group-hover:opacity-100"
                    fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
