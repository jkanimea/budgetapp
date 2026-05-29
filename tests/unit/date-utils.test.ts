import { describe, it, expect } from "vitest";
import { getWeekRange, getWeekKey, formatWeekLabel } from "@/lib/date-utils";

describe("date-utils", () => {
  it("getWeekRange returns Monday start for a mid-week date", () => {
    const wed = new Date(2024, 2, 13);
    const { start } = getWeekRange(wed);
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(11);
  });

  it("getWeekRange returns Sunday end for a mid-week date", () => {
    const wed = new Date(2024, 2, 13);
    const { end } = getWeekRange(wed);
    expect(end.getDay()).toBe(0);
    expect(end.getDate()).toBe(17);
  });

  it("getWeekRange with no arg uses current date", () => {
    const { start, end } = getWeekRange();
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(start <= end).toBe(true);
  });

  it("getWeekKey returns ISO string of the Monday", () => {
    const wed = new Date(2024, 2, 13);
    const key = getWeekKey(wed);
    expect(key).toBe("2024-03-11");
  });

  it("formatWeekLabel formats correctly", () => {
    const mon = new Date(2024, 2, 11);
    const label = formatWeekLabel(mon);
    expect(label).toContain("Mar 11");
    expect(label).toContain("Mar 17, 2024");
  });
});
