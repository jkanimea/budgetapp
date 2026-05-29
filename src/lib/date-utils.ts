import {
  startOfWeek,
  endOfWeek,
  format,
  subWeeks,
} from "date-fns";

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getWeekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function formatWeekLabel(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

export { format, subWeeks, startOfWeek, endOfWeek };
