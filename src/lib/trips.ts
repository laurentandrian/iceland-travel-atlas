// Editorial selection only: which WordPress trip categories to feature and in what order.
// All text, dates and photos come from WordPress.
export type TripConfig = {
  slug: string; // WordPress category slug
  pageSlug: string; // WordPress trip page (intro text)
  name: string;
  year: number;
  featured: boolean;
  // Destination marker on the world map: a well-known place of the trip (not a route).
  place: { label: string; coords: [number, number] };
};

export const TRIPS: TripConfig[] = [
  { slug: "islande-2026", pageSlug: "islande-2026-2", name: "Islande", year: 2026, featured: true, place: { label: "Reykjavik, Islande", coords: [64.1466, -21.9426] } },
  { slug: "tanzanie-2018", pageSlug: "tanzanie-2018", name: "Tanzanie", year: 2018, featured: true, place: { label: "Arusha, Tanzanie", coords: [-3.3869, 36.6830] } },
  { slug: "costarica-2016", pageSlug: "costa-rica-2016", name: "Costa Rica", year: 2016, featured: true, place: { label: "San José, Costa Rica", coords: [9.9281, -84.0907] } },
  { slug: "floride-2014", pageSlug: "floride-2014", name: "Floride", year: 2014, featured: false, place: { label: "Orlando, Floride", coords: [28.5383, -81.3792] } },
  { slug: "mada-2013", pageSlug: "madagascar-2013", name: "Madagascar", year: 2013, featured: false, place: { label: "Antananarivo, Madagascar", coords: [-18.8792, 47.5079] } },
  { slug: "boston", pageSlug: "boston-2012", name: "Boston", year: 2012, featured: false, place: { label: "Boston, États-Unis", coords: [42.3601, -71.0589] } },
  { slug: "nz-2012", pageSlug: "nouvelle-zelande-2012", name: "Nouvelle-Zélande", year: 2012, featured: false, place: { label: "Auckland, Nouvelle-Zélande", coords: [-36.8485, 174.7633] } },
];

export const findTrip = (slug: string) => TRIPS.find((t) => t.slug === slug);

// Approximate coordinates of each Iceland stage, keyed by WordPress post slug.
export const MAP_STOPS: Record<string, Record<string, [number, number]>> = {
  "islande-2026": {
    "journee-a-reykjavik": [64.1466, -21.9426],
    "la-peninsule-de-snaefellsnes": [64.8, -23.6],
    "vers-les-vallees-du-nord-vatnsnes-et-le-skagafjordur": [65.6, -19.9],
    "la-peninsule-de-trollaskagi-et-les-rives-de-leyjafjordur": [65.95, -18.6],
    "le-cercle-de-diamant-husavik-myvatn-et-asbyrgi": [65.6, -17.0],
    "husavik-detiffos-asbyrgi": [65.81, -16.4],
    "les-hauts-plateaux-de-modrudalur": [65.37, -15.88],
    "austurland-et-les-fjords-de-lest": [65.26, -14.0],
    "au-pied-du-grand-glacier-vatnajokull": [64.05, -16.2],
    "la-cote-sud-entre-plages-noires-et-cascades": [63.42, -19.0],
    "journee-dans-les-hautes-terres-le-landmannalaugar": [63.99, -19.06],
    "le-cercle-dor": [64.31, -20.3],
    "cest-le-dernier-jour": [64.0, -22.56],
  },
};
