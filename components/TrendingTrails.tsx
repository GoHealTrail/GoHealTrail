"use client";

import { useState } from "react";
import { TRAILS, DATA_AS_OF, type Difficulty, type Trail } from "@/lib/trails";
import { PERMITS } from "@/lib/permits";
import { TopoRoute } from "./TopoRoute";
import { LeadButton } from "./LeadForm";
import { Arrow, Bookmark, Peak, Sun, Thermo, Warn } from "./Icons";

const FILTERS: Array<"All" | Difficulty> = ["All", "Moderate", "Hard", "Strenuous"];
const LAYOUT = ["c-xl", "c-md", "c-sm", "c-sm", "c-4"];

function permitFor(t: Trail) {
  if (!t.posterName) return undefined;
  return PERMITS.find((p) => p.name === t.posterName && p.state === t.posterState);
}

function Weather({ t }: { t: Trail }) {
  return t.heatAlert ? (
    <span className="pill pill-heat"><Thermo size={13} /> {t.today.high}° / {t.today.low}° · Heat alert</span>
  ) : (
    <span className="pill pill-ok"><Sun size={13} /> {t.today.high}° / {t.today.low}° · No alerts</span>
  );
}

function PermitRow({ t }: { t: Trail }) {
  const p = permitFor(t);
  if (!p) return null;
  return (
    <div className="row">
      <span className={`pill ${p.mgp === "required" ? "pill-heat" : "pill-ok"}`}>MGP {p.mgp === "required" ? "required" : "not required"}</span>
      <span className={`pill ${p.permit === "ticket" ? "pill-ticket" : p.permit === "required" ? "pill-heat" : "pill-ok"}`}>
        {p.permit === "ticket" ? "Ticket entry" : p.permit === "required" ? "Permit required" : "No permit"}
      </span>
      {p.mgp === "required" && (
        <LeadButton type="guide" trail={`${p.name}, ${p.state}`} className="btn btn-ghost btn-sm">Find a guide</LeadButton>
      )}
    </div>
  );
}

function Card({ t, rank, cls, saved, onSave }: { t: Trail; rank: number; cls: string; saved: boolean; onSave: () => void }) {
  const xl = cls === "c-xl";
  return (
    <article className={`glass lift card ${cls} ${xl ? "card-xl" : ""} ${cls === "c-md" ? "card-md" : ""}`}>
      <div className="topo" style={{ flex: xl ? "1 1 340px" : cls === "c-md" ? "1 1 220px" : undefined, minHeight: xl ? 340 : cls === "c-md" ? 220 : 160 }}>
        <TopoRoute trail={t} scale={xl ? 1.12 : 1} />
        <span className="topo-label">#{String(rank).padStart(2, "0")} · {t.routeType}</span>
        <span className="topo-badge"><Weather t={t} /></span>
        {xl && <span className="topo-foot"><Peak size={14} /> Summit route · +{t.gainM.toLocaleString("en-MY")} m</span>}
      </div>
      <div className="card-body" style={cls === "c-md" ? { flex: "1 1 240px", padding: 8 } : undefined}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap" }}>
          <div style={{ minWidth: 0 }}>
            <h3>{t.name}</h3>
            <div className="loc">{t.location}</div>
          </div>
          <button type="button" className="icon-btn" aria-pressed={saved} aria-label={`${saved ? "Unsave" : "Save"} ${t.name}`} onClick={onSave}>
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <dl className="stats" style={xl ? undefined : { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div><dt>Length</dt><dd>{t.lengthKm} km</dd></div>
          <div><dt>Elev. gain</dt><dd>{t.gainM.toLocaleString("en-MY")} m</dd></div>
          <div><dt>Difficulty</dt><dd className={`diff-${t.difficulty}`}>{t.difficulty}</dd></div>
          <div><dt>Rating</dt><dd>{t.rating} ★</dd></div>
        </dl>
        <PermitRow t={t} />
        {xl && (
          <div className="row">
            {t.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            <div className="grow" />
            <LeadButton type="retreat" trail={t.name} className="btn btn-accent">Plan this trek <Arrow size={16} /></LeadButton>
          </div>
        )}
      </div>
    </article>
  );
}

export function TrendingTrails() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const list = filter === "All" ? TRAILS : TRAILS.filter((t) => t.difficulty === filter);
  const heat = TRAILS.filter((t) => t.heatAlert);
  const regions = Array.from(new Set(heat.map((t) => (t.posterState ?? t.location).split(",").pop()!.trim())));

  return (
    <section id="trending" className="section" aria-labelledby="trending-h">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">This week</span>
            <h2 id="trending-h" className="h2">Trending Trails</h2>
          </div>
          <div className="row">
            <div className="segmented" role="group" aria-label="Filter by difficulty">
              {FILTERS.map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <a href="#permits" className="btn btn-ghost">Browse all 258 <Arrow size={16} /></a>
          </div>
        </div>

        <div className="bento">
          {list.map((t) => (
            <Card
              key={t.id}
              t={t}
              rank={TRAILS.indexOf(t) + 1}
              cls={filter === "All" ? LAYOUT[TRAILS.indexOf(t)] : "c-4"}
              saved={saved.includes(t.id)}
              onSave={() => setSaved((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id]))}
            />
          ))}
          {list.length === 0 && <div className="empty c-8">No trending trails at this difficulty this week.</div>}

          <article id="safety" className={`glass safety ${filter === "All" ? "c-8" : "c-8"}`}>
            <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span className="icon-tile orange"><Warn size={24} /></span>
              <h3>Heat advisory on {heat.length} of {TRAILS.length} trending trails</h3>
              <p>
                Excessive heat is forecast this week across {regions.join(", ")}. Start early, carry more water than you think you need, and share your route before you go.
              </p>
              <div className="row">
                <LeadButton type="waitlist" className="btn btn-alpine">Get heat alerts for my trails</LeadButton>
                <a href={TRAILS[1].url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Full forecast</a>
              </div>
              <span className="source">Forecast via AllTrails, as of {DATA_AS_OF}.</span>
            </div>
            <ul className="heat-list" aria-label="Today's highs">
              {[...TRAILS].sort((a, b) => b.today.high - a.today.high).map((t) => (
                <li key={t.id}>
                  <span className="grow">{t.name.replace(" via West Trail", "").replace(" via Janda Baik", "").replace(" via Jalan Gunung Nuang", "")}</span>
                  <span className="mono">{t.today.high}°</span>
                  <span className={`pill ${t.heatAlert ? "pill-heat" : "pill-ok"}`}>{t.heatAlert ? "Heat" : "Clear"}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
