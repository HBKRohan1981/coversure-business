"use client";

import { useState } from "react";
import { CheckCircle2, Eye, FileText, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { useSession } from "@/lib/store";

/**
 * Documents repository (Screen 13) — "good to have, do NOT overbuild" per
 * global context. Shows the three analysed-document categories that fed
 * the assessment, plus whatever the user has uploaded this session
 * (useSession.uploadedDocs). View is a stub dialog (filename + status),
 * not a real viewer; Replace is just re-dropping into the dropzone below —
 * there is no versioning or real storage in this prototype.
 */
interface DocCategory {
  key: string;
  title: string;
  status: string;
  docs: string[];
}

const CATEGORIES: DocCategory[] = [
  {
    key: "financials",
    title: "Financials",
    status: "Analysed",
    docs: ["Audited Financials FY24.pdf"],
  },
  {
    key: "insurance",
    title: "Insurance policies",
    status: "4 documents analysed",
    docs: [
      "Current Policy Schedule.pdf",
      "Property & Fire Policy.pdf",
      "Public Liability Policy.pdf",
      "Employee Personal Accident Policy.pdf",
    ],
  },
  {
    key: "benefits",
    title: "Employee benefits",
    status: "Analysed",
    docs: ["Employee Census.xlsx"],
  },
];

export default function DocumentsPage() {
  const uploadedDocs = useSession((s) => s.uploadedDocs);
  const addUploadedDoc = useSession((s) => s.addUploadedDoc);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  function handleFiles(names: string[]) {
    names.forEach((name) => addUploadedDoc(name));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Documents
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        The documents that shaped your assessment, and anything you&apos;ve
        shared with us this session.
      </p>

      {/* Analysed-document categories */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Card key={cat.key} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base text-midnight">
                  {cat.title}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="w-fit gap-1 border-mint bg-mint/15 text-midnight"
              >
                <CheckCircle2 className="size-3.5 text-royal" aria-hidden />
                {cat.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Documents that contributed
              </p>
              <ul className="space-y-1.5">
                {cat.docs.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        className="size-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <span className="truncate">{doc}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingDoc(doc)}
                      className="flex shrink-0 items-center gap-1 text-xs font-medium text-royal hover:text-electric"
                    >
                      <Eye className="size-3.5" aria-hidden />
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Uploaded this session */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-midnight">
          Uploaded this session
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Anything you&apos;ve shared with us shows up here as it&apos;s
          reviewed.
        </p>

        {uploadedDocs.length === 0 ? (
          <Card className="mt-4 border-slate-200">
            <CardContent className="py-6 text-center text-sm text-slate-500">
              Nothing uploaded yet this session. Add a document below.
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 border-slate-200">
            <CardContent className="py-4">
              <ul className="space-y-1.5">
                {uploadedDocs.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        className="size-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <span className="truncate">{doc}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <Badge
                        variant="outline"
                        className="gap-1 border-mint bg-mint/15 text-midnight"
                      >
                        <CheckCircle2 className="size-3 text-royal" aria-hidden />
                        Analysed
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="flex items-center gap-1 text-xs font-medium text-royal hover:text-electric"
                      >
                        <Eye className="size-3.5" aria-hidden />
                        View
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload / replace */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-midnight">
          <RotateCcw className="size-4 text-slate-400" aria-hidden />
          Add or replace a document
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Drop a new file below to add it &mdash; or to replace one, drop the
          updated version the same way.
        </p>
        <div className="mt-4">
          <UploadDropzone
            category="documents"
            label="Drag and drop a document, or click to browse"
            onFiles={handleFiles}
          />
        </div>
      </div>

      <AssessmentDisclaimer className="mt-10" />

      {/* View stub dialog */}
      <Dialog
        open={viewingDoc !== null}
        onOpenChange={(open) => !open && setViewingDoc(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-midnight">
              <FileText className="size-5 text-slate-400" aria-hidden />
              <span className="truncate">{viewingDoc}</span>
            </DialogTitle>
            <DialogDescription>
              This document has been reviewed as part of your assessment.
            </DialogDescription>
          </DialogHeader>
          <Badge
            variant="outline"
            className="w-fit gap-1 border-mint bg-mint/15 text-midnight"
          >
            <CheckCircle2 className="size-3.5 text-royal" aria-hidden />
            Analysed
          </Badge>
        </DialogContent>
      </Dialog>
    </div>
  );
}
