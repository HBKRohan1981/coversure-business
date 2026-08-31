"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
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

const fieldLabel = "text-[13.5px] font-medium text-midnight";

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
      contactName: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferredContact,
      note: note.trim().length > 0 ? note.trim() : undefined,
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="cs-form text-center">
        <div
          aria-hidden
          className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-mint"
        >
          <Check className="size-8 text-midnight" aria-hidden />
        </div>
        <h1 className="h-panel mt-5 text-midnight">We&apos;ve got it</h1>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted-ink">
          A CoverSure specialist will review your requirement and help you
          with the next step.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/app/quotes">
            View your requests
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="mt-8 text-left">
          <AssessmentDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="cs-form">
      {/* Header */}
      <p className="kicker">Fix with CoverSure</p>
      <h1 className="h-panel mt-2 text-midnight">Let&apos;s fix it</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">
        {currentReco.title} — Recommended: {currentReco.recommended}
      </p>

      {/* What happens next */}
      <section className="mt-8">
        <h2 className="kicker">What happens next?</h2>
        <ol className="mt-3 space-y-3 rounded-2xl border border-line bg-white p-5 shadow-soft">
          {NEXT_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-[14.5px]">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-royal/10 text-[12px] font-semibold text-royal"
              >
                {i + 1}
              </span>
              <span className="text-ink">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Form */}
      <Card className="mt-8 rounded-2xl border-line shadow-soft">
        <CardContent className="px-[30px] py-[30px] sm:px-[34px] sm:py-[34px]">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="solution" className={fieldLabel}>
                What would you like help with?
              </Label>
              <Input
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson" className={fieldLabel}>
                Contact person
              </Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                aria-invalid={errors.contactPerson || undefined}
                className={errors.contactPerson ? "border-danger" : undefined}
              />
              {errors.contactPerson && (
                <p className="text-xs text-danger">
                  Please add a contact person.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className={fieldLabel}>
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={errors.phone || undefined}
                  className={errors.phone ? "border-danger" : undefined}
                />
                {errors.phone && (
                  <p className="text-xs text-danger">
                    Please add a phone number.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={fieldLabel}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errors.email || undefined}
                  className={errors.email ? "border-danger" : undefined}
                />
                {errors.email && (
                  <p className="text-xs text-danger">
                    Please add an email address.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContact" className={fieldLabel}>
                Preferred contact method
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="note" className={fieldLabel}>
                Optional note
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything else CoverSure should know?"
              />
            </div>

            <div className="flex justify-end border-t border-line pt-6">
              <Button type="submit" size="lg" className="gap-2">
                Request Options
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <AssessmentDisclaimer />
      </div>
    </div>
  );
}
