import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tripsQuery } from "@/lib/queries";
import { Header, Footer, Photo, fmtRange, PageError, PageNotFound } from "@/components/site";

export const Route = createFileRoute("/voyages/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(tripsQuery()),
  head: () => ({
    meta: [
      { title: "Voyages — LHTN Blog" },
      { name: "description", content: "Toutes nos destinations : Islande, Tanzanie, Costa Rica, Floride, Madagascar, Boston et Nouvelle-Zélande." },
      { property: "og:title", content: "Nos voyages — LHTN Blog" },
      { property: "og:description", content: "Les destinations de notre carnet de voyages en famille, de 2012 à aujourd'hui." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Voyages,
  errorComponent: ({ error }) => <><Header /><PageError error={error} /></>,
  notFoundComponent: PageNotFound,
});

function Voyages() {
  const { data: trips } = useSuspenseQuery(tripsQuery());
  const featured = trips.filter((t) => t.featured);
  const archive = trips.filter((t) => !t.featured);
  const [lead, ...rest] = featured;
  return (
    <div>
      <Header />
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-14 md:px-10">
        <p className="eyebrow text-accent">Destinations</p>
        <h1 className="mt-3 text-6xl md:text-7xl">Nos voyages</h1>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 md:px-10">
        {lead && <TripTile t={lead} big />}
        <div className="grid gap-6">{rest.map((t) => <TripTile key={t.slug} t={t} />)}</div>
      </section>

      <section className="mx-auto mt-32 max-w-7xl px-6 md:px-10">
        <p className="eyebrow text-accent">Archives</p>
        <h2 className="mt-3 text-4xl md:text-5xl">Les premiers voyages</h2>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {archive.map((t) => (
            <Link key={t.slug} to="/voyages/$slug" params={{ slug: t.slug }} className="group block">
              <div className="photo-zoom overflow-hidden">
                <Photo src={t.cover} alt={`${t.name} ${t.year}`} className="aspect-[4/5] w-full"
                  fallback={<div className="flex aspect-[4/5] w-full items-center justify-center bg-secondary font-serif text-6xl text-accent">{t.year}</div>} />
              </div>
              <h3 className="mt-4 text-2xl group-hover:text-accent">{t.name}</h3>
              <p className="eyebrow mt-1 text-muted-foreground">{t.year} · {t.count} récits</p>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function TripTile({ t, big = false }: { t: { slug: string; name: string; year: number; cover: string | null; start: string | null; end: string | null }; big?: boolean }) {
  return (
    <Link to="/voyages/$slug" params={{ slug: t.slug }} className="photo-zoom group relative block overflow-hidden">
      <Photo src={t.cover} alt={`${t.name} ${t.year}`} className={`w-full ${big ? "aspect-[4/5] md:h-full md:aspect-auto" : "aspect-[16/9]"}`}
        fallback={<div className="aspect-[16/9] w-full bg-foreground" />} />
      <div className="absolute inset-0 bg-gradient-to-t from-overlay to-transparent" />
      <div className="absolute bottom-0 p-6 text-on-photo md:p-8">
        <p className="eyebrow">{fmtRange(t.start, t.end)}</p>
        <h2 className={big ? "mt-2 text-5xl md:text-6xl" : "mt-2 text-4xl"}>{t.name} {t.year}</h2>
      </div>
    </Link>
  );
}
