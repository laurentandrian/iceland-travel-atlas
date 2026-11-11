const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress";
const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 5 * 60_000;

// Read-only: only GET requests are ever sent to WordPress.
export async function wpGet<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;
  const lovable = process.env['LOVABLE_API_KEY'];
  const wp = process.env['WORDPRESS_API_KEY'];
  if (!lovable || !wp) throw new Error("WordPress connection is not configured");
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": wp },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`WordPress request failed [${res.status}]: ${body}`);
    throw new Error(`WordPress request failed [${res.status}]`);
  }
  const data = (await res.json()) as T;
  cache.set(path, { at: Date.now(), data });
  return data;
}
