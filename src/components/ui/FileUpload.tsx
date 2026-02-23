"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils/cn";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function FileUpload({
  accept,
  onFileSelect,
  label = "Upload a file",
  hint,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <span className="block text-[13px] font-medium text-[#6E6E73]">
          {label}
        </span>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-all",
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/5"
            : "border-[#D2D2D7] bg-[#FAFAFA] hover:border-[#007AFF]/50 hover:bg-[#007AFF]/[0.02]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <svg
          className="mb-3 h-8 w-8 text-[#86868B]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        {fileName ? (
          <p className="text-[14px] font-medium text-[#1D1D1F]">{fileName}</p>
        ) : (
          <>
            <p className="text-[14px] font-medium text-[#1D1D1F]">
              Drop file here or{" "}
              <span className="text-[#007AFF]">browse</span>
            </p>
            {hint && (
              <p className="mt-1 text-[12px] text-[#86868B]">{hint}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
