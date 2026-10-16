import { NextResponse } from "next/server";

/**
 * Lead capture for waitlist / guide / permit-help / partner / retreat forms.
 *
 * Storage is deliberately NOT built in (no database). Set LEAD_WEBHOOK_URL to
 * any endpoint that accepts a JSON POST — e.g. a Google Apps Script web app
 * writing to a Sheet, Make/Zapier, Formspree, or your own API later.
 *
 * Without LEAD_WEBHOOK_URL:
 *   - development: the lead is logged to the server console and accepted.
 *   - production:  the request is rejected (503) so nobody is told
 *                  "we'll be in touch" when nothing was saved.
 */

const TYPES = new Set(["waitlist", "guide", "concierge", "partner", "retreat"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (clip(body.company, 200)) return NextResponse.json({ message: "Thanks — we'll be in touch." });

  const type = clip(body.type, 20);
  const email = clip(body.email, 200);
  if (!TYPES.has(type)) return NextResponse.json({ message: "Unknown form." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ message: "Please enter a valid email." }, { status: 400 });

  const lead = {
    type,
    email,
    name: clip(body.name, 120),
    trail: clip(body.trail, 160),
    note: clip(body.note, 1000),
    receivedAt: new Date().toISOString(),
  };

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (err) {
      console.error("[lead] webhook failed", err);
      return NextResponse.json({ message: "We couldn't save that just now. Please try again shortly." }, { status: 502 });
    }
    return NextResponse.json({ message: "Thanks — we'll be in touch." });
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[lead] (dev, not stored)", lead);
    return NextResponse.json({ message: "Thanks — received (dev mode: not stored)." });
  }

  return NextResponse.json({ message: "Sign-ups open soon — please check back." }, { status: 503 });
}
