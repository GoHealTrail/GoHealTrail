import type { Trail } from "@/lib/trails";

/** Tilted neon topographic tile. Contours and route are illustrative, not GPS data. */
export function TopoRoute({ trail, scale = 1 }: { trail: Trail; scale?: number }) {
  const { d, start, end, peak, tilt } = trail.route;
  const fid = `glow-${trail.id}`;
  const rings = [1, 0.8, 0.62, 0.45, 0.3, 0.16];
  return (
    <svg
      viewBox="0 0 300 180"
      aria-hidden
      style={{ transform: `rotateX(48deg) rotateZ(${tilt}deg) scale(${scale})` }}
    >
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g fill="none" stroke="var(--alpine)">
        {rings.map((r, i) => (
          <ellipse
            key={r}
            cx={peak[0] - (1 - r) * -6}
            cy={peak[1] + r * 18}
            rx={150 * r}
            ry={92 * r}
            strokeOpacity={0.08 + i * 0.06}
            transform={`rotate(${tilt * -0.6} ${peak[0]} ${peak[1]})`}
          />
        ))}
      </g>
      <path d={d} fill="none" stroke="var(--alpine)" strokeWidth="5" filter={`url(#${fid})`} opacity="0.85" />
      <path d={d} fill="none" stroke="var(--alpine-pale)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={start[0]} cy={start[1]} r="4.5" fill="var(--accent)" />
      <circle cx={end[0]} cy={end[1]} r="7" fill="none" stroke="var(--alpine)" strokeWidth="1.6" />
      <circle cx={end[0]} cy={end[1]} r="2.8" fill="#fff" />
    </svg>
  );
}
