export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const MS_PER_DAY = 86_400_000;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
}

export function createCalendarDate(year: number, month: number, day: number): CalendarDate | null {
  const valid =
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= 1000 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month);
  return valid ? { year, month, day } : null;
}

export function epochDay(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY;
}

export function fromEpochDay(days: number): CalendarDate {
  const d = new Date(days * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** Days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return epochDay(to) - epochDay(from);
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return epochDay(a) - epochDay(b);
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromEpochDay(epochDay(date) + days);
}

/** 0 = Monday … 6 = Sunday. */
export function dayOfWeek(date: CalendarDate): number {
  // 1970-01-01 was a Thursday (index 3).
  return (((epochDay(date) + 3) % 7) + 7) % 7;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

export function toIsoString(date: CalendarDate): string {
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

export function parseIsoDate(text: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  return match ? createCalendarDate(+match[1], +match[2], +match[3]) : null;
}

/** Boundary helper: local calendar date of a JS Date. */
export function fromJsDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}
