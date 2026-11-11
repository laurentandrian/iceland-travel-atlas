import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articleQuery } from "@/lib/queries";
import { Header, Footer, Photo, fmtDay, PageError, PageNotFound } from "@/components/site";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const t = `${loaderData.title} — LHTN Blog`;
    const desc = loaderData.excerpt || loaderData.tripName || "Carnet de voyages";
    return {
      meta: [
        { title: t }, { name: "description", content: desc },
        { property: "og:title", content: t }, { property: "og:description", content: desc },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.cover ? [{ property: "og:image", content: loaderData.cover }, { name: "twitter:image", content: loaderData.cover }] : []),
      ],
    };
  },
  component: Article,
  errorComponent: ({ error }) => <><Header /><PageError error={error} /></>,
  notFoundComponent: () => <><Header /><PageNotFound /></>,
});

function Article() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(articleQuery(slug));
  if (!a) return <PageNotFound />;
  return (
    <div>
      <Header />
      <article>
        <header className="mx-auto max-w-4xl px-6 pt-12 pb-10 sm:pt-20 sm:pb-12 text-center">
          {a.tripSlug && (
            <Link to="/voyages/$slug" params={{ slug: a.tripSlug }} className="eyebrow text-accent hover:underline">{a.tripName}</Link>
          )}
          <h1 className="rise mt-5 text-4xl sm:text-5xl leading-[1.08] md:text-7xl">{a.title}</h1>
          <p className="eyebrow mt-6 text-muted-foreground">{fmtDay(a.date)}</p>
        </header>
        {a.cover && (
          <div className="mx-auto max-w-6xl px-0 sm:px-6" style={a.coverWidth && a.coverWidth < 1100 ? { maxWidth: a.coverWidth } : undefined}><Photo src={a.cover} srcSet={a.coverSrcset} sizes="(min-width: 1152px) 1104px, 100vw" priority alt={a.title} className="mx-auto max-h-[85vh] w-full" fallback={null} /></div>
        )}
        <div className="prose-journal mx-auto mt-12 px-5 sm:mt-16 sm:px-6" dangerouslySetInnerHTML={{ __html: a.html }} />
      </article>

      <nav className="mx-auto mt-24 grid max-w-6xl gap-8 border-t border-border px-6 pt-10 md:grid-cols-3">
        <div>{a.prev && <Link to="/article/$slug" params={{ slug: a.prev.slug }} className="group block"><span className="eyebrow text-muted-foreground">← Étape précédente</span><span className="mt-2 block font-serif text-2xl group-hover:text-accent">{a.prev.title}</span></Link>}</div>
        <div className="text-center">{a.tripSlug && <Link to="/voyages/$slug" params={{ slug: a.tripSlug }} className="eyebrow inline-block border-b border-accent pb-1">Retour à {a.tripName}</Link>}</div>
        <div className="md:text-right">{a.next && <Link to="/article/$slug" params={{ slug: a.next.slug }} className="group block"><span className="eyebrow text-muted-foreground">Étape suivante →</span><span className="mt-2 block font-serif text-2xl group-hover:text-accent">{a.next.title}</span></Link>}</div>
      </nav>
      <Footer />
    </div>
  );
}
