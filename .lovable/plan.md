# Audit: LHTN travel blog (blog.timenoe.com) — findings and proposed approach

All checks below were read-only. Nothing was edited, published or deleted in WordPress.

## 1. Access
- Your self-hosted WordPress connection works (site name "LHTN Blog"). Posts, pages, categories and media can all be read.
- It is not yet linked to this project; linking is only needed once we build.

## 2. Content found
- Posts: more than 100 published (first page returned 100, oldest 2012), so the full list spans at least 2 pages.
- Pages (14): Home, Voyages, one page per trip (Islande 2026, Tanzanie 2018, Costa Rica 2016, Floride 2014, Madagascar 2013, Boston 2012, Nouvelle-Zelande 2012), plus older pages (En Partant, Entretien, Divers, Arrivee, a second "Home").
- Media: photos live in your WordPress uploads folder in several sizes (300px up to full ~1500x2000). Recent posts (Iceland) all have cover photos; most older posts (about 84 of the 100 checked) have none, so the new design needs a fallback (first photo in the article, or the trip cover).

## 3. How articles are organised
- One parent category "Voyages" with one sub-category per trip: islande-2026 (16), nz-2012 (27), boston (25), mada-2013 (24), costarica-2016 (17), floride-2014 (12), tanzanie-2018 (9).
- Other categories: famille (9), Divers (15), Non classe (8); Blog, Photo, Uncategorized are empty.
- Tags are not used.
- Each trip page acts as a hub: intro text + a list of that trip's posts.

## 4. Iceland 2026 in detail
- Trip: 20 June – 4 July 2026, organised via Evaneos with a French-speaking local guide.
- 16 daily posts, one per stage, in order: Reykjavik, Snaefellsnes, Vatnsnes/Skagafjordur, Trollaskagi/Eyjafjordur, Diamond Circle (Husavik, Myvatn), Husavik/Dettifoss/Asbyrgi, Modrudalur highlands, East Fjords, Vatnajokull, South Coast, Landmannalaugar, Golden Circle, last day, and a trip summary (~2,900 km in 14 days).
- Every Iceland post has a cover photo.
- The "map" is a static itinerary image (islande-2026-trip.png), not an interactive map. Place names are only in titles and text; no GPS data is stored.

## 5. Interactive features and plugins
- Built with Kadence Blocks and Elementor; Jetpack is active. Post lists on trip pages are standard WordPress query blocks.
- No interactive map plugin, no location fields, no custom content types detected.
- Main menu was not readable through this connection; navigation appears to follow Home > Voyages > trip pages.

## 6. Proposed way to connect the new site
- New site lives only on a Lovable address; your domain and current site stay untouched.
- The new site reads WordPress live through a secure server-side connection (password never reaches visitors' browsers). Read-only: it only uses "get" requests.
- No content is copied: posts, photos and categories are always loaded from WordPress, so editing there updates the new site automatically.
- Structure mapping:
  - Home -> latest trips and highlights
  - Trips -> one page per "Voyages" sub-category, posts in date order as a day-by-day journey
  - Article -> full post, photos served from your existing uploads
  - Misc -> famille / Divers sections
- Interactive map option for Iceland (and later other trips): we'd keep a small list of coordinates per stage inside the new site, so WordPress stays unchanged.
- Older Elementor/Kadence layout styling would be cleaned up so articles look consistent in the new design.

## Open questions before building
- Should the older pages (En Partant, Entretien, Divers, Arrivee) appear in the new site?
- Do you want an interactive Iceland map, and later for other trips?
- Keep French as the only language?
