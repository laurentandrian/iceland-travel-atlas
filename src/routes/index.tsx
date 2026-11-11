import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tripsQuery } from "@/lib/queries";
import { WorldAtlas } from "@/components/WorldAtlas";
import { Header, Footer, Photo, fmtRange, PageError, PageNotFound } from "@/components/site";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(tripsQuery()),
  head: () => ({
    meta: [
      { title: "LHTN Blog — Carnet de voyages en famille" },
      { name: "description", content: "Islande, Tanzanie, Costa Rica, Madagascar… le carnet de voyages d'une famille, en récits et en photos." },
      { property: "og:title", content: "LHTN Blog — Carnet de voyages" },
      { property: "og:description", content: "Récits et photographies de nos voyages en famille, de la Nouvelle-Zélande à l'Islande." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
  errorComponent: ({ error }) => <><Header /><PageError error={error} /></>,
  notFoundComponent: PageNotFound,
});

function Home() {
  const { data: trips } = useSuspenseQuery(tripsQuery());
  const iceland = trips.find((t) => t.slug === "islande-2026")!;
  const selected = trips.filter((t) => t.featured && t.slug !== "islande-2026");
  const archive = trips.filter((t) => !t.featured);
  return (
    <div>
      <section className="relative h-[92vh] min-h-[560px] overflow-hidden">
        <Header overPhoto />
        <Photo src={iceland.cover} srcSet={iceland.coverSrcset} sizes="max(100vw, 140vh)" priority alt="Islande 2026" className="absolute inset-0 h-full w-full" fallback={<div className="absolute inset-0 bg-foreground" />} />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent" />
        <div className="rise absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-16 text-on-photo md:px-10 md:pb-24">
          <p className="eyebrow">Carnet de voyages</p>
          <h1 className="mt-4 max-w-3xl text-[2.6rem] sm:text-5xl leading-[1.05] md:text-7xl lg:text-8xl">Partir, regarder, raconter.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <span className="rule-accent" />
        <h2 className="mt-8 text-3xl leading-tight md:text-5xl">Bienvenue sur notre blog de voyages en famille.</h2>
        <p className="mt-6 font-serif text-2xl leading-relaxed text-muted-foreground md:text-3xl">
          Retrouvez le récit au jour le jour de nos voyages : anecdotes, paysages, rencontres et petites aventures.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Link to="/voyages/$slug" params={{ slug: iceland.slug }} className="photo-zoom block overflow-hidden md:col-span-7">
            <Photo src={iceland.cover} srcSet={iceland.coverSrcset} sizes="(min-width: 768px) 58vw, 100vw" alt="Islande 2026" className="aspect-[4/5] w-full md:aspect-[4/3]" />
          </Link>
          <div className="md:col-span-5 md:pl-6">
            <p className="eyebrow text-accent">À la une · {fmtRange(iceland.start, iceland.end)}</p>
            <h2 className="mt-4 text-5xl md:text-6xl">Islande 2026</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Le tour de l'île en {iceland.count} étapes : des fjords de l'Est au glacier Vatnajökull, des plages noires aux Hautes Terres.
            </p>
            <Link to="/voyages/$slug" params={{ slug: iceland.slug }} className="eyebrow mt-8 inline-block border-b border-accent pb-1 hover:text-accent">Suivre le voyage</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-32 max-w-7xl px-6 md:px-10">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-4xl md:text-5xl">Voyages récents</h2>
          <Link to="/voyages" className="eyebrow hidden border-b border-accent pb-1 md:inline-block">Tous les voyages</Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {selected.map((t) => (
            <Link key={t.slug} to="/voyages/$slug" params={{ slug: t.slug }} className="group block">
              <div className="photo-zoom overflow-hidden"><Photo src={t.cover} srcSet={t.coverSrcset} sizes="(min-width: 768px) 50vw, 100vw" alt={`${t.name} ${t.year}`} className="aspect-[3/2] w-full" /></div>
              <p className="eyebrow mt-5 text-muted-foreground">{t.year} · {t.count} récits</p>
              <h3 className="mt-2 text-3xl group-hover:text-accent">{t.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-32 max-w-7xl px-6 md:px-10" aria-labelledby="atlas-title">
        <p className="eyebrow text-accent">Atlas</p>
        <h2 id="atlas-title" className="mt-3 text-4xl md:text-5xl">Nos voyages à travers le monde</h2>
        <p className="mt-4 mb-10 max-w-2xl text-muted-foreground">Depuis 2012, sept voyages en famille, de la Nouvelle-Zélande à l'Islande. Touchez un repère pour ouvrir le voyage.</p>
        <WorldAtlas trips={trips} />
      </section>

      <section className="mt-32 bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="eyebrow text-accent">Les archives</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Les premiers carnets, 2012 – 2014</h2>
          <ul className="mt-12 divide-y divide-border border-y border-border">
            {archive.map((t) => (
              <li key={t.slug}>
                <Link to="/voyages/$slug" params={{ slug: t.slug }} className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-6">
                  <span className="font-serif text-3xl group-hover:text-accent">{t.name}</span>
                  <span className="eyebrow text-muted-foreground">{t.year} · {t.count} récits</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
}
