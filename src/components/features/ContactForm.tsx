"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiPost } from "@/lib/api/http";
import type {
  ContactSubmitRequest,
  ContactSubmitResponse,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface ContactFormProps {
  submitPath: string;
  successMessage: string;
}

function toProxyApiPath(submitPath: string): string {
  const trimmed = submitPath.trim();
  if (!trimmed) {
    return "/contact";
  }

  if (trimmed.startsWith("/api/")) {
    return trimmed.replace(/^\/api/, "");
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
}

export function ContactForm({ submitPath, successMessage }: ContactFormProps) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState<string>("");

  const apiPath = useMemo(() => toProxyApiPath(submitPath), [submitPath]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setSubmitState("error");
      setFeedback("Please fill in name, email, and at least 10 characters in your mandate summary.");
      return;
    }

    setSubmitState("submitting");
    setFeedback("");

    const organization = [institution.trim(), region.trim()].filter(Boolean).join(" | ");

    const payload: ContactSubmitRequest = {
      name: name.trim(),
      email: email.trim(),
      organization: organization || undefined,
      message: message.trim(),
    };

    try {
      const response = await apiPost<ContactSubmitRequest, ContactSubmitResponse>(apiPath, payload);
      setSubmitState("success");
      setFeedback(successMessage || response.message);
      setMessage("");
    } catch {
      setSubmitState("error");
      setFeedback("Submission failed. Please retry in a moment.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label mb-1.5 block">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label mb-1.5 block">Institution</label>
          <input
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            placeholder="Fund / Desk / Institution"
          />
        </div>
        <div>
          <label className="label mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            placeholder="name@institution.com"
          />
        </div>
        <div>
          <label className="label mb-1.5 block">Region</label>
          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            placeholder="US / EU / APAC"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="label mb-1.5 block">Mandate Summary</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-32 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          placeholder="Share strategy type, capital profile, and timeline..."
        />
      </div>

      {feedback ? (
        <p
          className={cn(
            "mt-4 text-xs",
            submitState === "success" ? "text-gain" : submitState === "error" ? "text-loss" : "text-text-secondary",
          )}
        >
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="mt-5 h-11 rounded-lg bg-primary px-5 text-[11px] font-black uppercase tracking-[0.14em] text-text-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState === "submitting" ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
