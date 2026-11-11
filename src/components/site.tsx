import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import logo from "@/assets/lhtn-logo.png.asset.json";

export function Header({ overPhoto = false }: { overPhoto?: boolean }) {
  return (
    <header className={overPhoto ? "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-overlay to-transparent" : "border-b border-border bg-background"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" aria-label="LHTN Blog — accueil" className={overPhoto ? "rounded-sm bg-background/90 px-3 py-1" : ""}>
          <img src={logo.url} alt="LHTN Blog — Carnet de voyages" className="h-12 w-auto md:h-14" />
        </Link>
        <nav className={`eyebrow flex gap-6 md:gap-10 ${overPhoto ? "text-on-photo" : "text-foreground"}`}>
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-accent">Accueil</Link>
          <Link to="/voyages" className="hover:text-accent">Voyages</Link>
          <Link to="/voyages/$slug" params={{ slug: "islande-2026" }} className="hover:text-accent">Islande 2026</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-14 text-center md:px-10">
        <img src={logo.url} alt="" className="h-14 w-auto opacity-90" />
        <p className="text-sm text-muted-foreground">Carnet de voyages en famille, depuis 2012.</p>
        <nav className="eyebrow flex gap-8 text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Accueil</Link>
          <Link to="/voyages" className="hover:text-foreground">Voyages</Link>
        </nav>
      </div>
    </footer>
  );
}

// Image that never shows a broken placeholder: hides itself and shows the fallback on error.
export function Photo({ src, alt, className = "", fallback }: { src: string | null; alt: string; className?: string; fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback ?? <div className={`flex items-center justify-center bg-secondary ${className}`}><span className="rule-accent" /></div>}</>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

const MONTHS = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const fmtMonth = (d: string | null) => (d ? MONTHS.format(new Date(d)) : "");
export const fmtDay = (d: string) => DAY.format(new Date(d));
export function fmtRange(a: string | null, b: string | null) {
  if (!a || !b) return "";
  const s = fmtMonth(a), e = fmtMonth(b);
  return s === e ? s : `${s} – ${e}`;
}

export function PageError({ error }: { error: unknown }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="text-4xl">Contenu indisponible</h1>
      <p className="mt-4 text-muted-foreground">Le carnet n'a pas pu être chargé pour le moment. Réessayez dans un instant.</p>
      <p className="mt-2 text-xs text-muted-foreground">{error instanceof Error ? error.message : ""}</p>
      <Link to="/" className="eyebrow mt-8 inline-block border-b border-accent pb-1">Retour à l'accueil</Link>
    </div>
  );
}
export function PageNotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="text-4xl">Page introuvable</h1>
      <Link to="/voyages" className="eyebrow mt-8 inline-block border-b border-accent pb-1">Voir les voyages</Link>
    </div>
  );
}
