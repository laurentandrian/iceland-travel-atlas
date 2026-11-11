import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TRIPS, findTrip, MAP_STOPS } from "./trips";
import { decodeEntities, stripTags, firstImage, allImages, cleanContent } from "./html";

type RawPost = {
  id: number; slug: string; date: string; title: { rendered: string };
  excerpt: { rendered: string }; content: { rendered: string }; featured_media: number; categories: number[];
};
type RawMedia = { id: number; source_url: string; media_details?: { width?: number; height?: number; sizes?: Record<string, { source_url: string }> } };

export type PostCard = { slug: string; title: string; date: string; excerpt: string; image: string | null; coords: [number, number] | null };
export type TripSummary = { slug: string; name: string; year: number; featured: boolean; cover: string | null; start: string | null; end: string | null; count: number };

async function wp() { return await import("./wp.server"); }

async function categoryIds(): Promise<Record<string, number>> {
  const { wpGet } = await wp();
  const cats = await wpGet<{ id: number; slug: string }[]>("/categories?per_page=100&_fields=id,slug");
  return Object.fromEntries(cats.map((c) => [c.slug, c.id]));
}

const landscape = new Set<string>();
async function mediaMap(ids: number[]): Promise<Record<number, string>> {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { wpGet } = await wp();
  const media = await wpGet<RawMedia[]>(`/media?per_page=100&include=${uniq.sort().join(",")}&_fields=id,source_url,media_details`);
  return Object.fromEntries(media.map((m) => {
    const url = m.media_details?.sizes?.["large"]?.source_url ?? m.source_url;
    const w = m.media_details?.width ?? 0, h = m.media_details?.height ?? 0;
    if (w > h) landscape.add(url);
    return [m.id, url];
  }));
}

async function tripPosts(tripSlug: string): Promise<{ posts: PostCard[]; raw: RawPost[] }> {
  const { wpGet } = await wp();
  const ids = await categoryIds();
  const cat = ids[tripSlug];
  if (!cat) return { posts: [], raw: [] };
  const raw = await wpGet<RawPost[]>(`/posts?categories=${cat}&per_page=100&status=publish&orderby=date&order=asc&_fields=id,slug,date,title,excerpt,content,featured_media,categories`);
  const media = await mediaMap(raw.map((p) => p.featured_media));
  const stops = MAP_STOPS[tripSlug] ?? {};
  const posts = raw.map((p) => ({
    slug: p.slug,
    title: decodeEntities(p.title.rendered),
    date: p.date,
    excerpt: stripTags(p.excerpt.rendered).slice(0, 220),
    image: media[p.featured_media] ?? firstImage(p.content.rendered),
    coords: stops[p.slug] ?? null,
  }));
  return { posts, raw };
}

function summarize(t: (typeof TRIPS)[number], posts: PostCard[]): TripSummary {
  const rev = [...posts].reverse();
  const withImg = rev.find((p) => p.image && landscape.has(p.image)) ?? rev.find((p) => p.image);
  return { slug: t.slug, name: t.name, year: t.year, featured: t.featured, cover: withImg?.image ?? null, start: posts[0]?.date ?? null, end: posts.at(-1)?.date ?? null, count: posts.length };
}

export const getTrips = createServerFn({ method: "GET" }).handler(async () => {
  const out = await Promise.all(TRIPS.map(async (t) => summarize(t, (await tripPosts(t.slug)).posts)));
  return out;
});

export const getTrip = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const t = findTrip(data.slug);
    if (!t) return null;
    const { wpGet } = await wp();
    const [{ posts }, pages] = await Promise.all([
      tripPosts(t.slug),
      wpGet<{ content: { rendered: string } }[]>(`/pages?slug=${encodeURIComponent(t.pageSlug)}&_fields=content`),
    ]);
    const pageHtml = pages[0]?.content.rendered ?? "";
    // Intro = page paragraphs before the post list; itinerary image if present.
    const introHtml = pageHtml.split(/<div class="wp-block-query/)[0] ?? "";
    const intro = [...introHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1] ?? "")).filter(Boolean);
    const itineraryImage = allImages(introHtml)[0] ?? null;
    return { trip: summarize(t, posts), intro, itineraryImage, posts };
  });

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { wpGet } = await wp();
    const res = await wpGet<RawPost[]>(`/posts?slug=${encodeURIComponent(data.slug)}&status=publish&_fields=id,slug,date,title,excerpt,content,featured_media,categories`);
    const p = res[0];
    if (!p) return null;
    const ids = await categoryIds();
    const byId = Object.fromEntries(Object.entries(ids).map(([s, i]) => [i, s]));
    const tripSlug = p.categories.map((c) => byId[c]).find((s) => s && findTrip(s)) ?? null;
    const media = await mediaMap([p.featured_media]);
    let prev: PostCard | null = null, next: PostCard | null = null, tripName: string | null = null;
    if (tripSlug) {
      const { posts } = await tripPosts(tripSlug);
      const i = posts.findIndex((x) => x.slug === p.slug);
      prev = posts[i - 1] ?? null; next = posts[i + 1] ?? null;
      const t = findTrip(tripSlug)!; tripName = `${t.name} ${t.year}`;
    }
    return {
      slug: p.slug, title: decodeEntities(p.title.rendered), date: p.date,
      excerpt: stripTags(p.excerpt.rendered).slice(0, 160),
      cover: media[p.featured_media] ?? null,
      html: cleanContent(p.content.rendered),
      tripSlug, tripName, prev, next,
    };
  });
