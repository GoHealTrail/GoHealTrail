import { SearchForm } from "./SearchForm";
import { Check } from "./Icons";
import { DATA_AS_OF, KINABALU_WEEK, TRAILS } from "@/lib/trails";

function Scene() {
  return (
    <svg className="hero-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Misty mountain ridges at sunrise">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060A14" />
          <stop offset="0.38" stopColor="#151833" />
          <stop offset="0.58" stopColor="#4A2440" />
          <stop offset="0.72" stopColor="#B9473A" />
          <stop offset="0.82" stopColor="#F07A3E" />
          <stop offset="1" stopColor="#FFC48A" />
        </linearGradient>
        <radialGradient id="sunglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE2B8" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#FF9A5A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7D6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFE7D6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFE7D6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="leftshade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0A0F1C" stopOpacity="0.92" />
          <stop offset="0.4" stopColor="#0A0F1C" stopOpacity="0.45" />
          <stop offset="0.65" stopColor="#0A0F1C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bottomfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.82" stopColor="#0A0F1C" stopOpacity="0" />
          <stop offset="1" stopColor="#0A0F1C" stopOpacity="1" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id="haze"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <circle cx="820" cy="590" r="360" fill="url(#sunglow)" />
      <circle cx="820" cy="590" r="54" fill="#FFE9C9" />
      <path d="M0 600 L120 566 L230 588 L340 528 L470 566 L560 506 L690 548 L800 478 L900 524 L1010 462 L1120 514 L1240 474 L1340 516 L1440 492 L1440 900 L0 900Z" fill="#5A2E48" opacity="0.75" filter="url(#haze)" />
      <rect x="-50" y="520" width="1540" height="150" fill="url(#mist)" filter="url(#soft)" opacity="0.75" />
      <path d="M0 680 L90 642 L200 666 L310 602 L380 622 L470 562 L560 612 L650 590 L760 642 L860 600 L960 652 L1080 588 L1180 632 L1300 572 L1440 622 L1440 900 L0 900Z" fill="#26203A" />
      <path d="M470 562 L560 612 L650 590 M1080 588 L1180 632 L1300 572" fill="none" stroke="#FF8A50" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="-50" y="630" width="1540" height="130" fill="url(#mist)" filter="url(#soft)" opacity="0.55" />
      <path d="M0 790 L140 724 L260 752 L380 702 L520 762 L640 732 L760 782 L880 700 L940 660 L1000 606 L1050 648 L1120 598 L1200 660 L1290 704 L1380 682 L1440 700 L1440 900 L0 900Z" fill="#0E1424" />
      <path d="M880 700 L940 660 L1000 606 L1050 648 L1120 598 L1200 660" fill="none" stroke="#FFB27A" strokeOpacity="0.55" strokeWidth="1.6" />
      <rect width="1440" height="900" fill="url(#leftshade)" />
      <rect width="1440" height="900" fill="url(#bottomfade)" />
    </svg>
  );
}

export function Hero() {
  const k = TRAILS[0];
  const max = 24, span = 10, h = 60;
  return (
    <header id="top" className="hero">
      <Scene />
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="badge-line"><span className="dot pulse" /> Trail discovery · Malaysia</div>
          <h1>
            <span>Forge Your</span>
            <span>Own <em>Path.</em></span>
          </h1>
          <p className="hero-sub">
            Find the trail, camp or summit that gives you room to breathe. Honest difficulty, trailhead forecasts and the permit &amp; guide rules for 258 forest-reserve hikes — before you go.
          </p>
          <SearchForm />
        </div>

        <aside id="conditions" aria-label="Trail conditions" className="conditions glass lift">
          <div className="cond-head">
            <span>Trailhead forecast</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--alpine-soft)" }}>
              <span className="dot" style={{ width: 7, height: 7 }} /> {DATA_AS_OF}
            </span>
          </div>
          <div>
            <div className="display" style={{ fontWeight: 700, fontSize: 24 }}>{k.name}</div>
            <div className="loc">{k.location}</div>
          </div>
          <div className="cond-temp">
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <strong>{k.today.high}°</strong>
              <span style={{ color: "var(--muted)", fontSize: 15 }}>/ {k.today.low}° today</span>
            </div>
            <span className="pill pill-ok"><Check size={13} /> No alerts</span>
          </div>
          <div className="week" role="img" aria-label={`7-day forecast: highs ${Math.min(...KINABALU_WEEK.map((d) => d.hi))} to ${Math.max(...KINABALU_WEEK.map((d) => d.hi))} °C`}>
            {KINABALU_WEEK.map((d) => {
              const peak = d.hi === Math.max(...KINABALU_WEEK.map((x) => x.hi));
              return (
                <div key={d.d} className="week-day">
                  <span style={peak ? { color: "#fff", fontWeight: 600 } : undefined}>{d.hi}°</span>
                  <div className="week-track">
                    <div className="week-bar" style={{ top: ((max - d.hi) / span) * h, height: ((d.hi - d.lo) / span) * h, background: peak ? "var(--accent)" : undefined }} />
                  </div>
                  <small>{d.d}</small>
                </div>
              );
            })}
          </div>
          <div className="stat-pair">
            <div className="stat-box"><span>Elevation gain</span><b>+{k.gainM.toLocaleString("en-MY")} m</b></div>
            <div className="stat-box"><span>Length</span><b>{k.lengthKm} km</b></div>
          </div>
          <div className="source">Trail stats &amp; forecast: <a href={k.url} target="_blank" rel="noopener noreferrer">AllTrails</a></div>
        </aside>
      </div>
    </header>
  );
}
