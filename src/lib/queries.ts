import { queryOptions } from "@tanstack/react-query";
import { getTrips, getTrip, getArticle } from "./wp.functions";

const staleTime = 5 * 60_000;
export const tripsQuery = () => queryOptions({ queryKey: ["trips"], queryFn: () => getTrips(), staleTime });
export const tripQuery = (slug: string) => queryOptions({ queryKey: ["trip", slug], queryFn: () => getTrip({ data: { slug } }), staleTime });
export const articleQuery = (slug: string) => queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }), staleTime });
