import { OFFERS, BUSINESS_OFFERS } from "@/lib/site";
import { LeadButton } from "./LeadForm";
import { Check, Compass, Guide, Shield, Tent } from "./Icons";

export function Features() {
  return (
    <section id="heal" className="section" aria-labelledby="heal-h">
      <div className="container">
        <div className="section-head">
          <h2 id="heal-h" className="h2" style={{ flex: "1 1 420px" }}>Go outside.<br />Come back lighter.</h2>
          <p className="lede" style={{ flex: "1 1 360px" }}>
            GoHealTrail is for people who head outdoors to reset — a hike, a night under canvas, a quiet ridge at dawn. Everything you need to choose well and get home safe.
          </p>
        </div>
        <div className="features">
          <div className="feature glass lift">
            <span className="icon-tile green"><Compass size={24} /></span>
            <h3>Discover</h3>
            <p>Filter trails by elevation, difficulty and weather. Honest route data before you commit.</p>
          </div>
          <div className="feature glass lift">
            <span className="icon-tile green"><Tent size={24} /></span>
            <h3>Plan &amp; pack</h3>
            <p>Day-by-day itineraries, a map of pins and notes, and a packing and budget checklist for camps and treks.</p>
          </div>
          <div className="feature glass lift">
            <span className="icon-tile orange"><Shield size={24} /></span>
            <h3>Stay safe</h3>
            <p>Heat and storm alerts, offline routes for places with no signal, and trip check-ins that alert your people if you don&apos;t.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Plans() {
  return (
    <section id="plans" className="section" aria-labelledby="plans-h">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Plans</span>
            <h2 id="plans-h" className="h2">Free to explore. Better with Pro.</h2>
          </div>
          <p className="lede">The permit checker and trail search stay free. Pro and guided retreats pay for the rest.</p>
        </div>
        <div className="offers">
          {OFFERS.map((o) => (
            <div key={o.id} className={`offer glass lift ${o.highlight ? "hl" : ""}`}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3>{o.title}</h3>
                {o.highlight && <span className="pill pill-heat">Most useful</span>}
              </div>
              <div className="price">
                <b>{o.price ?? "Early access"}</b>
                <span>{o.priceNote}</span>
              </div>
              <p style={{ margin: 0, color: "var(--muted)" }}>{o.blurb}</p>
              <ul>
                {o.points.map((p) => <li key={p}><Check size={16} />{p}</li>)}
              </ul>
              {o.id === "explorer" ? (
                <a href="#permits" className="btn btn-ghost btn-lg">{o.cta}</a>
              ) : (
                <LeadButton type={o.leadType} className={`btn btn-lg ${o.highlight ? "btn-accent" : "btn-ghost"}`}>{o.cta}</LeadButton>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  return (
    <section id="partners" className="section" aria-labelledby="partners-h">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">For guides &amp; businesses</span>
            <h2 id="partners-h" className="h2">Grow with the people already planning the trip.</h2>
          </div>
          <div className="row">
            <span className="icon-tile green"><Guide size={24} /></span>
            <p className="lede" style={{ maxWidth: 420 }}>
              Every hiker who checks a guide-required trail is a booking looking for a guide.
            </p>
          </div>
        </div>
        <div className="biz">
          {BUSINESS_OFFERS.map((b) => (
            <div key={b.title} className="biz-card glass lift">
              <h3>{b.title}</h3>
              <p>{b.body}</p>
              <LeadButton type={b.leadType} className="btn btn-ghost">{b.cta}</LeadButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta glass">
          <svg viewBox="0 0 800 300" preserveAspectRatio="xMaxYMid slice" aria-hidden>
            <g fill="none" stroke="var(--alpine)">
              {[[320, 190, 0.06], [250, 148, 0.08], [184, 108, 0.11], [120, 70, 0.15], [60, 34, 0.22]].map(([rx, ry, o]) => (
                <ellipse key={rx} cx="700" cy="150" rx={rx} ry={ry} strokeOpacity={o} />
              ))}
            </g>
          </svg>
          <h2>Your next trail is closer than you think.</h2>
          <div className="row">
            <a href="#permits" className="btn btn-accent btn-lg">Start exploring</a>
            <LeadButton type="waitlist" className="btn btn-ghost btn-lg">Join the community</LeadButton>
          </div>
        </div>
      </div>
    </section>
  );
}
