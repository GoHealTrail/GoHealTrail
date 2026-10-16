import { Arrow, Logo } from "./Icons";
import { SITE } from "@/lib/site";
import { FORESTRY_CONTACT } from "@/lib/permits";

export function Nav() {
  return (
    <div className="dock-wrap">
      <nav aria-label="Primary" className="dock glass">
        <a href="#top" className="brand" aria-label={`${SITE.name} home`}>
          <span className="brand-mark"><Logo /></span>
          {SITE.name}
        </a>
        <div className="navlinks">
          <a href="#trending">Trails</a>
          <a href="#permits">Permits &amp; guides</a>
          <a href="#safety">Safety</a>
          <a href="#plans">Plans</a>
          <a href="#partners">Partners</a>
        </div>
        <div className="nav-spacer" />
        <a href="#plans" className="nav-signin">Sign in</a>
        <a href="#permits" className="btn btn-accent">Start exploring <Arrow size={16} /></a>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="brand" style={{ fontSize: 16 }}>
          <span className="brand-mark" style={{ width: 28, height: 28, borderRadius: 8 }}><Logo size={16} /></span>
          {SITE.name}
        </span>
        <div className="footer-links">
          <a href="#trending">Trails</a>
          <a href="#permits">Permit checker</a>
          <a href="#plans">Plans</a>
          <a href="#partners">Partners</a>
          {SITE.contactEmail && <a href={`mailto:${SITE.contactEmail}`}>Contact</a>}
        </div>
        <div className="grow" />
        <small>
          Permit data: {FORESTRY_CONTACT.name}. GoHealTrail is independent and not affiliated with any government agency. © {new Date().getFullYear()} {SITE.name}
        </small>
      </div>
    </footer>
  );
}
