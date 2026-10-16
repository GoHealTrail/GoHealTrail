"use client";

import { useEffect, useMemo, useState } from "react";
import { PERMITS, STATES, FORESTRY_CONTACT, type PermitEntry, type Requirement } from "@/lib/permits";
import { LeadButton } from "./LeadForm";
import { Search } from "./Icons";

type Mode = "all" | "mgp" | "no-mgp" | "no-permit";
const MODES: Array<[Mode, string]> = [
  ["all", "All"],
  ["mgp", "Guide required"],
  ["no-mgp", "No guide needed"],
  ["no-permit", "No permit needed"],
];
const PAGE = 24;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function ReqPill({ label, v }: { label: string; v: Requirement }) {
  const cls = v === "required" ? "pill-heat" : v === "ticket" ? "pill-ticket" : "pill-ok";
  const txt = v === "required" ? "required" : v === "ticket" ? "ticket" : "not required";
  return <span className={`pill ${cls}`}>{label} {txt}</span>;
}

function Result({ p }: { p: PermitEntry }) {
  return (
    <li className="result">
      <div className="result-top">
        <div style={{ minWidth: 0 }}>
          <b>{p.name}</b>
          <small>{p.state}</small>
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>#{p.no}</span>
      </div>
      <div className="row">
        <ReqPill label="MGP" v={p.mgp} />
        <ReqPill label="Permit" v={p.permit} />
      </div>
      {(p.mgp === "required" || p.permit !== "not-required") && (
        <div className="row">
          {p.mgp === "required" && (
            <LeadButton type="guide" trail={`${p.name}, ${p.state}`} className="btn btn-alpine btn-sm">Find a guide</LeadButton>
          )}
          {p.permit === "required" && (
            <LeadButton type="concierge" trail={`${p.name}, ${p.state}`} className="btn btn-ghost btn-sm">Get permit help</LeadButton>
          )}
        </div>
      )}
    </li>
  );
}

export function PermitChecker({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [state, setState] = useState<string>("all");
  const [mode, setMode] = useState<Mode>("all");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    const onSearch = (e: Event) => {
      setQ((e as CustomEvent<string>).detail);
      setState("all");
      setMode("all");
    };
    window.addEventListener("ght:search", onSearch);
    return () => window.removeEventListener("ght:search", onSearch);
  }, []);

  useEffect(() => setLimit(PAGE), [q, state, mode]);

  const results = useMemo(() => {
    const words = norm(q).split(" ").filter(Boolean);
    return PERMITS.filter((p) => {
      if (state !== "all" && p.state !== state) return false;
      if (mode === "mgp" && p.mgp !== "required") return false;
      if (mode === "no-mgp" && p.mgp === "required") return false;
      if (mode === "no-permit" && p.permit !== "not-required") return false;
      if (!words.length) return true;
      const hay = norm(`${p.name} ${p.state}`);
      return words.every((w) => hay.includes(w));
    });
  }, [q, state, mode]);

  const total = PERMITS.length;
  const mgp = PERMITS.filter((p) => p.mgp === "required").length;
  const permit = PERMITS.filter((p) => p.permit !== "not-required").length;
  const free = PERMITS.filter((p) => p.mgp !== "required" && p.permit === "not-required").length;

  return (
    <section id="permits" className="section" aria-labelledby="permits-h">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Permit &amp; guide checker</span>
            <h2 id="permits-h" className="h2">Know before you go.</h2>
          </div>
          <p className="lede">
            Every hiking location inside Peninsular Malaysia&apos;s Permanent Forest Reserves, and whether it needs a forestry-certified mountain guide (Malim Gunung Perhutanan, MGP) or an entry permit.
          </p>
        </div>

        <div className="checker glass">
          <div className="kpis">
            <div className="kpi"><b>{total}</b><span>hiking locations · {STATES.length} states</span></div>
            <div className="kpi"><b style={{ color: "var(--accent-text)" }}>{mgp}</b><span>need an MGP guide</span></div>
            <div className="kpi"><b>{permit}</b><span>need a permit or ticket</span></div>
            <div className="kpi"><b style={{ color: "var(--alpine-soft)" }}>{free}</b><span>need neither</span></div>
          </div>

          <div className="controls">
            <label className="field" style={{ flex: "1 1 280px" }}>
              <Search size={18} style={{ color: "var(--faint)" }} />
              <span className="sr-only">Search locations</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a hill, gunung or trail" />
            </label>
            <label className="field">
              <span className="sr-only">State</span>
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="all">All states</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="segmented" role="group" aria-label="Requirement filter">
              {MODES.map(([m, label]) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{label}</button>
              ))}
            </div>
          </div>

          <p aria-live="polite" style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            {results.length} {results.length === 1 ? "location" : "locations"}
            {q && <> matching “{q}”</>}
          </p>

          {results.length ? (
            <ul className="results" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {results.slice(0, limit).map((p) => <Result key={p.id} p={p} />)}
            </ul>
          ) : (
            <div className="empty">
              Not on the forest-reserve list. That doesn&apos;t mean it&apos;s free to enter — state parks and private land have their own rules.
            </div>
          )}
          {results.length > limit && (
            <button type="button" className="btn btn-ghost" style={{ alignSelf: "center" }} onClick={() => setLimit((l) => l + PAGE * 2)}>
              Show more ({results.length - limit} left)
            </button>
          )}

          <div className="disclaimer">
            Source: {FORESTRY_CONTACT.name}, “Lokasi Pendakian Dalam Hutan Simpanan Kekal Semenanjung Malaysia”. Rules change — confirm with the State Forestry Department before your trip.
            {" "}{FORESTRY_CONTACT.address} · Tel {FORESTRY_CONTACT.tel} ·{" "}
            <a href={FORESTRY_CONTACT.web} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>forestry.gov.my</a>
          </div>
        </div>
      </div>
    </section>
  );
}
