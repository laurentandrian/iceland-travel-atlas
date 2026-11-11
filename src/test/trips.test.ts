import { describe, expect, it } from "vitest";
import { TRIPS } from "@/lib/trips";

describe("trip selection", () => {
  it("features Iceland 2026 first", () => {
    expect(TRIPS[0]?.slug).toBe("islande-2026");
    expect(TRIPS[0]?.featured).toBe(true);
  });
  it("keeps 2012–2014 trips in the archive", () => {
    expect(TRIPS.filter((t) => t.year <= 2014).every((t) => !t.featured)).toBe(true);
  });
  it("gives every published trip a world map location", () => {
    expect(TRIPS.map((t) => t.slug).sort()).toEqual(["boston", "costarica-2016", "floride-2014", "islande-2026", "mada-2013", "nz-2012", "tanzanie-2018"]);
    expect(TRIPS.every((t) => Math.abs(t.place.coords[0]) <= 90 && Math.abs(t.place.coords[1]) <= 180)).toBe(true);
  });
});
