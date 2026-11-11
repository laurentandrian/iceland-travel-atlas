import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TRIPS, findTrip, MAP_STOPS } from "./trips";
import { decodeEntities, stripTags, allImages, cleanContent } from "./html";

type RawPost = {
  id: number; slug: string; date: string; title: { rendered: string };
  excerpt: { rendered: string }; content: { rendered: string }; featured_media: number; categories: number[];
};
type RawMedia = { id: number; source_url: string; media_details?: { width?: number; height?: number; sizes?: Record<string, { source_url: string; width?: number }> } };
export type Img = { src: string; srcset: string | null; width: number };

export type PostCard = { slug: string; title: string; date: string; excerpt: string; image: string | null; srcset: string | null; width: number; coords: [number, number] | null };
export type TripSummary = { slug: string; name: string; year: number; featured: boolean; cover: string | null; coverSrcset: string | null; coverWidth: number; start: string | null; end: string | null; count: number };

async function wp() { return await import("./wp.server"); }

async function categoryIds(): Promise<Record<string, number>> {
  const { wpGet } = await wp();
  const cats = await wpGet<{ id: number; slug: string }[]>("/categories?per_page=100&_fields=id,slug");
  return Object.fromEntries(cats.map((c) => [c.slug, c.id]));
}

const landscape = new Set<string>();
// Largest variant up to ~2048px wide (never a thumbnail), plus a srcset of all real sizes.
function pickMedia(m: RawMedia): Img {
  const full = { url: m.source_url, w: m.media_details?.width ?? 0 };
  const variants = Object.values(m.media_details?.sizes ?? {}).map((v) => ({ url: v.source_url, w: v.width ?? 0 })).filter((v) => v.w >= 480);
  const all = [...variants, full].filter((v) => v.w > 0).sort((a, b) => a.w - b.w);
  const uniq = all.filter((v, i) => all.findIndex((x) => x.w === v.w) === i);
  const best = [...uniq].reverse().find((v) => v.w <= 2048) ?? uniq[0] ?? full;
  return { src: best.url, srcset: uniq.length > 1 ? uniq.map((v) => `${v.url} ${v.w}w`).join(", ") : null, width: best.w };
}
// For posts without a featured image: first body image, using its own srcset to find the largest source.
function bodyImage(html: string): Img | null {
  const tag = html.match(/<img[^>]+>/i)?.[0];
  if (!tag) return null;
  const src = tag.match(/\ssrc=["']([^"']+)["']/i)?.[1];
  if (!src) return null;
  const srcset = tag.match(/\ssrcset=["']([^"']+)["']/i)?.[1] ?? null;
  const cands = (srcset ?? "").split(",").map((c) => c.trim().split(/\s+/)).map(([u, w]) => ({ url: u ?? "", w: parseInt(w ?? "0") })).filter((c) => c.url && c.w);
  const best = cands.filter((c) => c.w <= 2048).sort((a, b) => b.w - a.w)[0];
  const w = best?.w ?? parseInt(tag.match(/\swidth=["']?(\d+)/i)?.[1] ?? "0");
  return { src: best?.url ?? src, srcset, width: w };
}

async function mediaMap(ids: number[]): Promise<Record<number, Img>> {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { wpGet } = await wp();
  const media = await wpGet<RawMedia[]>(`/media?per_page=100&include=${uniq.sort().join(",")}&_fields=id,source_url,media_details`);
  return Object.fromEntries(media.map((m) => {
    const img = pickMedia(m);
    const w = m.media_details?.width ?? 0, h = m.media_details?.height ?? 0;
    if (w > h) landscape.add(img.src);
    return [m.id, img];
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
  const posts = raw.map((p) => { const img = media[p.featured_media] ?? bodyImage(p.content.rendered); return {
    slug: p.slug,
    title: decodeEntities(p.title.rendered),
    date: p.date,
    excerpt: stripTags(p.excerpt.rendered).slice(0, 220),
    image: img?.src ?? null, srcset: img?.srcset ?? null, width: img?.width ?? 0,
    coords: stops[p.slug] ?? null,
  }; });
  return { posts, raw };
}

function summarize(t: (typeof TRIPS)[number], posts: PostCard[]): TripSummary {
  const rev = [...posts].reverse();
  const withImg = rev.find((p) => p.image && landscape.has(p.image) && p.width >= 1200) ?? rev.find((p) => p.image && landscape.has(p.image)) ?? rev.find((p) => p.image);
  return { slug: t.slug, name: t.name, year: t.year, featured: t.featured, cover: withImg?.image ?? null, coverSrcset: withImg?.srcset ?? null, coverWidth: withImg?.width ?? 0, start: posts[0]?.date ?? null, end: posts.at(-1)?.date ?? null, count: posts.length };
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
      cover: media[p.featured_media]?.src ?? null, coverSrcset: media[p.featured_media]?.srcset ?? null, coverWidth: media[p.featured_media]?.width ?? 0,
      html: cleanContent(p.content.rendered),
      tripSlug, tripName, prev, next,
    };
  });
