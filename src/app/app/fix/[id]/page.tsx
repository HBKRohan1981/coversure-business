"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { demoCompany } from "@/lib/demo-data";
import { useSession } from "@/lib/store";

export interface FixPageProps {
  params: { id: string };
}

const NEXT_STEPS = [
  "Review your requirement",
  "Compare suitable options",
  "Get quotes",
  "Choose your solution",
  "CoverSure helps manage it",
];

type PreferredContact = "Phone" | "Email" | "WhatsApp";

/**
 * "Fix with CoverSure" lead capture + confirmation (Screen 11) — the
 * commercial endpoint of the highest-priority journey (Assessment ->
 * Recommendation -> Fix with CoverSure). Submits into useSession.submitRequest,
 * which persists the request so it shows up in the Quotes tracker.
 */
export default function FixPage({ params }: FixPageProps) {
  const reco = demoCompany.recommendations.find((r) => r.id === params.id);

  if (!reco) {
    notFound();
  }

  // Re-bind to a definitely-assigned const so the type stays narrowed
  // inside nested closures (e.g. handleSubmit) below.
  const currentReco = reco;

  const submitRequest = useSession((s) => s.submitRequest);

  const [solution, setSolution] = useState(currentReco.recommended);
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] =
    useState<PreferredContact>("Phone");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{
    contactPerson?: boolean;
    phone?: boolean;
    email?: boolean;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = {
      contactPerson: contactPerson.trim().length === 0,
      phone: phone.trim().length === 0,
      email: email.trim().length === 0,
    };
    setErrors(nextErrors);

    if (nextErrors.contactPerson || nextErrors.phone || nextErrors.email) {
      return;
    }

    submitRequest({
      recommendationId: currentReco.id,
      solution: solution.trim().length > 0 ? solution : currentReco.recommended,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferredContact,
      note: note.trim().length > 0 ? note.trim() : undefined,
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <Card className="border-electric/20 bg-electric/5">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-midnight">
              <CheckCircle2 aria-hidden className="size-6" />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
                We&apos;ve got it
              </h1>
              <p className="text-base text-slate-700">
                A CoverSure specialist will review your requirement and help
                you with the next step.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-2 bg-electric hover:bg-electric/90"
            >
              <Link href="/app/quotes">
                View your requests
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8">
          <AssessmentDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Let&apos;s fix it
      </h1>
      <p className="mt-2 text-base text-slate-700">
        {currentReco.title} — Recommended: {currentReco.recommended}
      </p>

      {/* What happens next */}
      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          What happens next?
        </h2>
        <Card className="border-slate-200">
          <CardContent className="space-y-3 py-5">
            {NEXT_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-700">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Form */}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="solution">What would you like help with?</Label>
          <Input
            id="solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            aria-invalid={errors.contactPerson || undefined}
            className={errors.contactPerson ? "border-destructive" : undefined}
          />
          {errors.contactPerson && (
            <p className="text-xs text-destructive">
              Please add a contact person.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={errors.phone || undefined}
              className={errors.phone ? "border-destructive" : undefined}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">
                Please add a phone number.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email || undefined}
              className={errors.email ? "border-destructive" : undefined}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                Please add an email address.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredContact">Preferred contact method</Label>
          <Select
            value={preferredContact}
            onValueChange={(v) => setPreferredContact(v as PreferredContact)}
          >
            <SelectTrigger id="preferredContact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Optional note</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything else CoverSure should know?"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="bg-electric hover:bg-electric/90"
          >
            Request Options
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <AssessmentDisclaimer />
      </div>
    </div>
  );
}
