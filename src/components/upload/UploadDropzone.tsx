"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadDropzoneProps {
  category: string;
  label: string;
  onFiles: (names: string[]) => void;
}

/**
 * Drag-and-drop file picker. No real upload happens — dropped/selected
 * files are only listed by name in the UI, and their names are reported
 * to the caller via `onFiles`. Accepts multiple files, including repeat
 * drops (names accumulate).
 */
export function UploadDropzone({ category, label, onFiles }: UploadDropzoneProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setFileNames((prev) => {
        const next = [...prev, ...acceptedFiles.map((f) => f.name)];
        onFiles(next);
        return next;
      });
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div className="space-y-2.5" data-category={category}>
      <div
        {...getRootProps()}
        className={cn(
          "drop flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[rgba(0,50,200,.28)] bg-app-bg/50 p-8 text-center transition-colors hover:border-electric hover:bg-electric/[.04]",
          isDragActive && "border-electric bg-electric/[.06]"
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-royal transition-colors",
            isDragActive && "border-electric bg-electric text-white"
          )}
        >
          <UploadCloud className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-[14.5px] font-medium text-midnight">{label}</p>
        <p className="text-[12.5px] text-muted-ink">
          {isDragActive
            ? "Drop the files here"
            : "Drag and drop files here, or click to browse"}
        </p>
      </div>

      {fileNames.length > 0 && (
        <ul className="space-y-1.5">
          {fileNames.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] text-ink"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-ink" aria-hidden />
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
