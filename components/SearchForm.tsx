"use client";

import { useState } from "react";
import { Bars, Peak, Search, Shield } from "./Icons";

/** Hero search — sends the query to the permit & trail checker below. */
export function SearchForm() {
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    url.hash = "permits";
    window.history.pushState(null, "", url);
    window.dispatchEvent(new CustomEvent("ght:search", { detail: q.trim() }));
    document.getElementById("permits")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <form role="search" className="search glass" onSubmit={submit}>
      <div className="search-row">
        <Search size={20} style={{ color: "var(--faint)" }} />
        <label htmlFor="hero-q" className="sr-only">Search trails, peaks or parks</label>
        <input
          id="hero-q"
          type="search"
          placeholder="Search trails, peaks or parks — e.g. Gunung Nuang"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-accent">Search</button>
      </div>
      <div className="chips">
        <a href="#trending" className="chip chip-on"><Peak size={15} /> Elevation</a>
        <a href="#trending" className="chip"><Bars size={15} /> Difficulty</a>
        <a href="#safety" className="chip"><span className="dot pulse" style={{ width: 7, height: 7 }} /> Live Weather</a>
        <a href="#permits" className="chip"><Shield size={15} /> Permit &amp; guide</a>
      </div>
    </form>
  );
}
