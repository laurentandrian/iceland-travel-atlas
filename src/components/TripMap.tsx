import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { PostCard } from "@/lib/wp.functions";

export default function TripMap({ stops, onOpen }: { stops: PostCard[]; onOpen: (slug: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (!el.current || cancelled) return;
      const pts = stops.filter((s) => s.coords);
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 18 }).addTo(map);
      const css = getComputedStyle(document.documentElement);
      const accent = css.getPropertyValue("--accent").trim();
      const ink = css.getPropertyValue("--foreground").trim();
      const latlngs = pts.map((p) => p.coords!) as [number, number][];
      L.polyline(latlngs, { color: ink, weight: 1.5, dashArray: "4 6" }).addTo(map);
      pts.forEach((p, i) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:26px;height:26px;border-radius:50%;background:${accent};color:${ink};display:flex;align-items:center;justify-content:center;font:500 12px Jost,sans-serif;border:2px solid ${css.getPropertyValue("--background").trim()}">${i + 1}</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        L.marker(p.coords!, { icon, title: p.title }).addTo(map!).bindTooltip(p.title).on("click", () => onOpen(p.slug));
      });
      if (latlngs.length) map.fitBounds(latlngs, { padding: [30, 30] });
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [stops, onOpen]);
  return <div ref={el} className="h-[420px] w-full md:h-[560px]" aria-label="Carte de l'itinéraire" />;
}
