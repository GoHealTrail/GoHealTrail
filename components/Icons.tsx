import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const Arrow = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Peak = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 20l6-10 4 6 3-4 5 8z" /></svg>);
export const Bars = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 20v-5M12 20V9M19 20V4" /></svg>);
export const Search = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const Check = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12l5 5L20 7" /></svg>);
export const Sun = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const Thermo = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M14 14.8V4a2 2 0 10-4 0v10.8a4 4 0 104 0z" /></svg>);
export const Bookmark = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 3h12v18l-6-4-6 4z" /></svg>);
export const Warn = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3L2 20h20z" /><path d="M12 10v4M12 17h.01" /></svg>);
export const Shield = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>);
export const Compass = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>);
export const Tent = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 20l9-15 9 15z" /><path d="M12 20v-6" /></svg>);
export const Guide = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="6" r="3" /><path d="M6 21v-4a6 6 0 0112 0v4M12 12v9" /></svg>);
export const Doc = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>);
export const Close = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);

export const Logo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#062B1F" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 19l6.5-11 4 6.5 2.5-4L21 19z" />
  </svg>
);
