import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tripsQuery } from "@/lib/queries";
import { Header, Footer, PageError, PageNotFound } from "@/components/site";
import { WorldAtlas } from "@/components/WorldAtlas";

export const Route = createFileRoute("/carte")({
  loader: ({ context }) => context.queryClient.ensureQueryData(tripsQuery()),
  head: () => ({
    meta: [
      { title: "Carte du monde — LHTN Blog" },
      { name: "description", content: "La carte de nos voyages en famille depuis 2012 : Islande, Tanzanie, Costa Rica, Floride, Madagascar, Boston, Nouvelle-Zélande." },
      { property: "og:title", content: "La carte de nos voyages — LHTN Blog" },
      { property: "og:description", content: "Parcourez sur une carte toutes les destinations de notre carnet de voyages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Carte,
  errorComponent: ({ error }) => <><Header /><PageError error={error} /></>,
  notFoundComponent: PageNotFound,
});

function Carte() {
  const { data: trips } = useSuspenseQuery(tripsQuery());
  return (
    <div>
      <Header />
      <section className="atlas-contours mx-auto max-w-7xl px-6 pt-16 pb-10 md:px-10 md:pt-20">
        <p className="eyebrow text-accent">Atlas · 7 destinations · 2012 — 2026</p>
        <h1 className="mt-3 text-5xl md:text-7xl">Nos voyages à travers le monde</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">Sept voyages depuis 2012. Choisissez une destination sur la carte ou dans la liste.</p>
      </section>
      <section className="mx-auto max-w-7xl px-6 md:px-10"><WorldAtlas trips={trips} height="h-[440px] md:h-[620px]" /></section>
      <Footer />
    </div>
  );
}
