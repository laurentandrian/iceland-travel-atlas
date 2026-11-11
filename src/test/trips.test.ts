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
});
