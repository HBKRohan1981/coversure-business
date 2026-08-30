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
    <div className="space-y-2" data-category={category}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors",
          isDragActive && "border-electric bg-electric/5"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud
          className={cn("h-8 w-8", isDragActive ? "text-electric" : "text-slate-400")}
          aria-hidden
        />
        <p className="text-sm font-medium text-midnight">{label}</p>
        <p className="text-xs text-slate-500">
          {isDragActive
            ? "Drop the files here"
            : "Drag and drop files here, or click to browse"}
        </p>
      </div>

      {fileNames.length > 0 && (
        <ul className="space-y-1">
          {fileNames.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
