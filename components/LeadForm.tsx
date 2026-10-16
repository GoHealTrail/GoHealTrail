"use client";

import { useId, useRef, useState } from "react";
import type { LeadType } from "@/lib/site";
import { Close } from "./Icons";

const COPY: Record<LeadType, { title: string; body: string; note: string }> = {
  waitlist: { title: "Join the early list", body: "Be first in when Trail Pro opens. No spam — one email when it's ready.", note: "Trails you hike most (optional)" },
  guide: { title: "Find a certified guide", body: "Tell us the trail and date. We'll match you with a Malim Gunung Perhutanan (MGP) guide for that forest reserve.", note: "Preferred date, group size" },
  concierge: { title: "Permit help", body: "We'll prepare your entry-permit application and guide booking for you. Permits are issued only by the State Forestry Department.", note: "Trail, date, group size" },
  partner: { title: "Partner with GoHealTrail", body: "Campsite, homestay, gear rental, guide agency or brand — tell us about you.", note: "Business name, location, what you offer" },
  retreat: { title: "Healing retreat dates", body: "Get the next small-group trail & camping weekend dates in your inbox.", note: "Region you'd like to go (optional)" },
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string };

export function LeadButton({
  type,
  label,
  trail,
  className = "btn btn-accent",
  children,
}: {
  type: LeadType;
  label?: string;
  trail?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const id = useId();
  const c = COPY[type];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          trail,
          email: fd.get("email"),
          name: fd.get("name"),
          note: fd.get("note"),
          company: fd.get("company"), // honeypot
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
      setStatus({ kind: "ok", msg: data.message || "Thanks — we'll be in touch." });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setStatus({ kind: "idle" });
          ref.current?.showModal();
        }}
      >
        {children ?? label}
      </button>
      <dialog ref={ref} className="lead" aria-labelledby={`${id}-t`} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <form className="lead-inner" onSubmit={onSubmit}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap" }}>
            <h3 id={`${id}-t`}>{c.title}</h3>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => ref.current?.close()}><Close /></button>
          </div>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: 15, lineHeight: 1.6 }}>{c.body}</p>
          {trail && <span className="pill pill-muted" style={{ alignSelf: "flex-start" }}>Trail: {trail}</span>}
          <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <label>Name<input name="name" autoComplete="name" /></label>
          <label>{c.note}<textarea name="note" maxLength={1000} /></label>
          <input name="company" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />
          {status.kind === "ok" && <div className="lead-msg ok" role="status">{status.msg}</div>}
          {status.kind === "err" && <div className="lead-msg err" role="alert">{status.msg}</div>}
          <button type="submit" className="btn btn-accent btn-lg" disabled={status.kind === "sending" || status.kind === "ok"}>
            {status.kind === "sending" ? "Sending…" : status.kind === "ok" ? "Sent" : "Send"}
          </button>
          <small style={{ color: "var(--faint)" }}>We only use your details to reply to this request.</small>
        </form>
      </dialog>
    </>
  );
}
