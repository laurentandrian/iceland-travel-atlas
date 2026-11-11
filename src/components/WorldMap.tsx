import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type WorldPoint = { slug: string; label: string; coords: [number, number] };

// Leaflet world map with one keyboard-focusable marker per trip. Selection is handled by the parent.
export default function WorldMap({ points, selected, onSelect, height = "h-[380px] md:h-[520px]" }: { points: WorldPoint[]; selected: string | null; onSelect: (slug: string) => void; height?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const markers = useRef<Map<string, import("leaflet").Marker>>(new Map());
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (!el.current || cancelled) return;
      map = L.map(el.current, { scrollWheelZoom: false, worldCopyJump: true, minZoom: 0, maxZoom: 8, zoomSnap: 0.25 });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", noWrap: true }).addTo(map);
      const css = getComputedStyle(document.documentElement);
      const accent = css.getPropertyValue("--accent").trim(), bg = css.getPropertyValue("--background").trim();
      map.fitBounds(points.map((p) => p.coords), { padding: [24, 24] });
      points.forEach((p) => {
        const icon = L.divIcon({ className: "", iconSize: [22, 22], iconAnchor: [11, 11],
          html: `<span style="display:block;width:22px;height:22px;border-radius:50%;background:${accent};border:3px solid ${bg};box-shadow:0 0 0 1px ${accent}"></span>` });
        const m = L.marker(p.coords, { icon, title: p.label, alt: p.label, keyboard: true, riseOnHover: true }).addTo(map!);
        m.on("click", () => onSelect(p.slug));
        const node = m.getElement();
        node?.setAttribute("aria-label", p.label);
        node?.setAttribute("role", "button");
        node?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(p.slug); } });
        markers.current.set(p.slug, m);
      });
    })();
    return () => { cancelled = true; markers.current.clear(); map?.remove(); };
  }, [points, onSelect]);
  useEffect(() => {
    markers.current.forEach((m, slug) => m.setZIndexOffset(slug === selected ? 1000 : 0));
  }, [selected]);
  return <div ref={el} className={`${height} w-full`} role="region" aria-label="Carte du monde de nos voyages" />;
}
