import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/lhtn-logo-trimmed.png.asset.json";

export function Header({ overPhoto = false }: { overPhoto?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const tone = overPhoto ? "text-on-photo" : "text-foreground";
  const links = (cls: string) => (
    <>
      <Link to="/" activeOptions={{ exact: true }} className={cls} onClick={() => setOpen(false)}>Accueil</Link>
      <Link to="/voyages" activeOptions={{ exact: true }} className={cls} onClick={() => setOpen(false)}>Voyages</Link>
      <Link to="/voyages/$slug" params={{ slug: "islande-2026" }} className={cls} onClick={() => setOpen(false)}>Islande 2026</Link>
    </>
  );
  return (
    <header className={overPhoto ? "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-overlay to-transparent" : "relative z-20 border-b border-border bg-background"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4">
        <Link to="/" aria-label="LHTN Blog — accueil" className="shrink-0 py-1">
          <img src={logo.url} alt="LHTN Blog — Carnet de voyages" width={1096} height={432} className={`h-9 w-auto md:h-11 ${overPhoto ? "logo-on-photo" : ""}`} />
        </Link>
        <nav aria-label="Navigation principale" className={`eyebrow hidden gap-10 md:flex ${tone}`}>
          {links("py-2 hover:text-accent")}
        </nav>
        <button type="button" className={`eyebrow -mr-2 flex min-h-11 min-w-11 items-center justify-center gap-2 px-2 md:hidden ${tone}`}
          aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen((o) => !o)}>
          <span>{open ? "Fermer" : "Menu"}</span>
          <span aria-hidden className="relative block h-3 w-5">
            <span className={`absolute left-0 h-px w-5 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-5 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="eyebrow mx-4 mb-3 flex flex-col border border-border bg-background text-foreground shadow-sm md:hidden">
          {links("border-b border-border px-5 py-4 last:border-b-0 hover:text-accent")}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-14 text-center md:px-10">
        <img src={logo.url} alt="" width={1096} height={432} className="h-12 w-auto" />
        <p className="text-sm text-muted-foreground">Carnet de voyages en famille, depuis 2012.</p>
        <nav className="eyebrow flex gap-8 text-muted-foreground">
          <Link to="/" className="py-3 hover:text-foreground">Accueil</Link>
          <Link to="/voyages" className="py-3 hover:text-foreground">Voyages</Link>
        </nav>
      </div>
    </footer>
  );
}

// Image that never shows a broken placeholder: hides itself and shows the fallback on error.
export function Photo({ src, alt, className = "", fallback, srcSet, sizes = "100vw", priority = false }: { src: string | null; alt: string; className?: string; fallback?: ReactNode; srcSet?: string | null; sizes?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback ?? <div className={`flex items-center justify-center bg-secondary ${className}`}><span className="rule-accent" /></div>}</>;
  return <img src={src} srcSet={srcSet ?? undefined} sizes={srcSet ? sizes : undefined} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
    {...(priority ? { fetchPriority: "high" as const } : {})} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
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
