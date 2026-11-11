import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import type { TripSummary } from "@/lib/wp.functions";
import { TRIPS } from "@/lib/trips";
import { Photo } from "@/components/site";
import { InView } from "@/components/InView";

const WorldMap = lazy(() => import("@/components/WorldMap"));

// World map + accessible destination list; uses the already-cached trip summaries (no extra WordPress calls).
export function WorldAtlas({ trips, height = "h-[380px] md:h-[520px]" }: { trips: TripSummary[]; height?: string }) {
  const points = useMemo(() => TRIPS.map((t) => ({ slug: t.slug, label: `${t.name} ${t.year}`, coords: t.place.coords })), []);
  const [selected, setSelected] = useState<string | null>(null);
  const onSelect = useCallback((s: string) => setSelected(s), []);
  const sel = trips.find((t) => t.slug === selected);
  const selPlace = TRIPS.find((t) => t.slug === selected)?.place;
  const ph = <div className={`${height} w-full bg-secondary`} />;
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="atlas-frame relative border border-sand lg:col-span-8">
        <p aria-hidden className="pointer-events-none absolute right-3 top-3 z-[600] bg-background/85 px-2 py-1 font-sans text-[0.65rem] tracking-[0.2em] text-accent">PROJECTION WEB MERCATOR · OSM</p>
        <InView placeholder={ph}>
          <ClientOnly fallback={ph}><Suspense fallback={ph}><WorldMap points={points} selected={selected} onSelect={onSelect} height={height} /></Suspense></ClientOnly>
        </InView>
        {sel && (
          <div role="dialog" aria-label={`${sel.name} ${sel.year}`} className="absolute bottom-3 left-3 right-3 z-[500] flex gap-4 border border-sand border-l-2 border-l-terracotta bg-background p-3 shadow-md sm:right-auto sm:w-96">
            <Photo src={sel.cover} srcSet={sel.coverSrcset} sizes="96px" alt="" className="h-20 w-24 shrink-0" fallback={<div className="h-20 w-24 shrink-0 bg-secondary" />} />
            <div className="min-w-0 flex-1">
              <p className="font-serif text-2xl leading-tight">{sel.name} <span className="italic">{sel.year}</span></p>
              {selPlace && <p className="mt-1 text-xs text-accent">{selPlace.label} · <span className="tabular-nums">{fmtCoords(selPlace.coords)}</span></p>}
              <p className="eyebrow mt-1 text-muted-foreground">{sel.count} récits</p>
              <Link to="/voyages/$slug" params={{ slug: sel.slug }} className="eyebrow mt-2 inline-block border-b border-accent pb-0.5 hover:text-accent">Voir le voyage</Link>
            </div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Fermer" className="-m-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">×</button>
          </div>
        )}
      </div>
      <ul className="divide-y divide-border border-y border-border lg:col-span-4" aria-label="Destinations">
        {TRIPS.map((t) => (
          <li key={t.slug} className="flex items-baseline justify-between gap-4 py-3">
            <button type="button" onClick={() => setSelected(t.slug)} aria-pressed={selected === t.slug} className="group text-left">
              <span className={`flex items-center gap-2 font-serif text-2xl group-hover:text-accent ${selected === t.slug ? "text-accent" : ""}`}><span aria-hidden className={`inline-block h-2 w-2 rounded-full ${selected === t.slug ? "bg-terracotta" : "bg-accent"}`} />{t.name}</span>
              <span className="block pl-4 text-xs text-muted-foreground">{t.place.label} · <span className="tabular-nums">{fmtCoords(t.place.coords)}</span></span>
            </button>
            <Link to="/voyages/$slug" params={{ slug: t.slug }} className="eyebrow shrink-0 text-muted-foreground hover:text-accent">{t.year} →</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Format stored [lat, lng] as e.g. "64.15° N · 21.94° O" (French cardinal points).
export function fmtCoords([lat, lng]: [number, number]) {
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"} · ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? "E" : "O"}`;
}
