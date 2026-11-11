import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense, useCallback } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { tripQuery } from "@/lib/queries";
import { Header, Footer, Photo, fmtRange, fmtDay, PageError, PageNotFound } from "@/components/site";

const TripMap = lazy(() => import("@/components/TripMap"));

export const Route = createFileRoute("/voyages/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(tripQuery(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const t = `${loaderData.trip.name} ${loaderData.trip.year} — LHTN Blog`;
    const desc = loaderData.intro[0] ?? `Notre voyage : ${loaderData.trip.name} ${loaderData.trip.year}.`;
    const img = loaderData.trip.cover;
    return {
      meta: [
        { title: t }, { name: "description", content: desc },
        { property: "og:title", content: t }, { property: "og:description", content: desc },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: Trip,
  errorComponent: ({ error }) => <><Header /><PageError error={error} /></>,
  notFoundComponent: () => <><Header /><PageNotFound /></>,
});

function Trip() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(tripQuery(slug));
  const navigate = useNavigate();
  const open = useCallback((s: string) => navigate({ to: "/article/$slug", params: { slug: s } }), [navigate]);
  if (!data) return <PageNotFound />;
  const { trip, intro, itineraryImage, posts } = data;
  const hasMap = posts.some((p) => p.coords);
  return (
    <div>
      <section className="relative h-[80vh] min-h-[480px] overflow-hidden">
        <Header overPhoto />
        <Photo src={trip.cover} alt={trip.name} className="absolute inset-0 h-full w-full" fallback={<div className="absolute inset-0 bg-foreground" />} />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-transparent" />
        <div className="rise absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-14 text-on-photo md:px-10">
          <p className="eyebrow">{fmtRange(trip.start, trip.end)} · {trip.count} récits</p>
          <h1 className="mt-3 text-6xl md:text-8xl">{trip.name} <span className="italic">{trip.year}</span></h1>
        </div>
      </section>

      {intro.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span className="rule-accent" />
          {intro.map((p, i) => <p key={i} className="mt-6 font-serif text-2xl leading-relaxed">{p}</p>)}
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <h2 className="mb-8 text-4xl">L'itinéraire</h2>
        {hasMap ? (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="border border-border lg:col-span-8">
              <ClientOnly fallback={<div className="h-[420px] bg-secondary md:h-[560px]" />}>
                <Suspense fallback={<div className="h-[420px] bg-secondary md:h-[560px]" />}><TripMap stops={posts} onOpen={open} /></Suspense>
              </ClientOnly>
            </div>
            <ol className="space-y-3 lg:col-span-4">
              {posts.filter((p) => p.coords).map((p, i) => (
                <li key={p.slug}>
                  <Link to="/article/$slug" params={{ slug: p.slug }} className="group flex gap-4">
                    <span className="eyebrow w-6 shrink-0 pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="group-hover:text-accent">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : itineraryImage ? (
          <img src={itineraryImage} alt={`Itinéraire ${trip.name}`} className="mx-auto w-full max-w-4xl" loading="lazy" />
        ) : (
          <ol className="grid gap-x-10 gap-y-3 md:grid-cols-2">
            {posts.map((p, i) => (
              <li key={p.slug}><Link to="/article/$slug" params={{ slug: p.slug }} className="group flex gap-4"><span className="eyebrow w-6 pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span><span className="group-hover:text-accent">{p.title}</span></Link></li>
            ))}
          </ol>
        )}
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-6 md:px-10">
        <h2 className="mb-12 text-4xl">Le carnet, jour après jour</h2>
        <div className="space-y-20">
          {posts.map((p, i) => (
            <Link key={p.slug} to="/article/$slug" params={{ slug: p.slug }} className={`group grid items-center gap-8 md:grid-cols-12 ${p.image ? "" : "md:pl-[calc(100%/12*5)]"}`}>
              {p.image && (
                <div className={`photo-zoom overflow-hidden md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}>
                  <Photo src={p.image} alt={p.title} className="aspect-[3/2] w-full" />
                </div>
              )}
              <div className={p.image ? `md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1 md:row-start-1" : ""}` : "md:col-span-12"}>
                <p className="eyebrow text-muted-foreground">{fmtDay(p.date)}</p>
                <h3 className="mt-3 text-3xl leading-tight group-hover:text-accent md:text-4xl">{p.title}</h3>
                {p.excerpt && <p className="mt-4 line-clamp-3 text-muted-foreground">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
