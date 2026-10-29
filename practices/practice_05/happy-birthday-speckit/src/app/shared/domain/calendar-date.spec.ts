import {
  addDays,
  compareDates,
  createCalendarDate,
  dayOfWeek,
  daysBetween,
  daysInMonth,
  fromJsDate,
  isLeapYear,
  parseIsoDate,
  toIsoString,
} from './calendar-date';

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('calendar-date', () => {
  it('detects leap years including century rules', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it('knows month lengths', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2023, 4)).toBe(30);
    expect(daysInMonth(2023, 12)).toBe(31);
  });

  it('creates valid dates and rejects invalid ones', () => {
    expect(createCalendarDate(1972, 5, 19)).toEqual(d(1972, 5, 19));
    expect(createCalendarDate(2024, 2, 29)).toEqual(d(2024, 2, 29));
    expect(createCalendarDate(2023, 2, 29)).toBeNull();
    expect(createCalendarDate(1990, 2, 31)).toBeNull();
    expect(createCalendarDate(2000, 13, 1)).toBeNull();
    expect(createCalendarDate(2000, 0, 1)).toBeNull();
    expect(createCalendarDate(2000, 1, 0)).toBeNull();
    expect(createCalendarDate(999, 1, 1)).toBeNull();
    expect(createCalendarDate(10000, 1, 1)).toBeNull();
    expect(createCalendarDate(2000.5, 1, 1)).toBeNull();
  });

  it('counts days across year and leap boundaries', () => {
    expect(daysBetween(d(2026, 12, 20), d(2027, 1, 5))).toBe(16);
    expect(daysBetween(d(2024, 2, 28), d(2024, 3, 1))).toBe(2);
    expect(daysBetween(d(2026, 3, 1), d(2026, 2, 26))).toBe(-3);
  });

  it('compares and adds days', () => {
    expect(compareDates(d(2026, 1, 1), d(2026, 1, 2))).toBeLessThan(0);
    expect(compareDates(d(2026, 1, 2), d(2026, 1, 2))).toBe(0);
    expect(addDays(d(2026, 12, 31), 1)).toEqual(d(2027, 1, 1));
    expect(addDays(d(2026, 3, 1), -1)).toEqual(d(2026, 2, 28));
  });

  it('returns Monday-based weekday', () => {
    expect(dayOfWeek(d(2026, 10, 26))).toBe(0); // Monday
    expect(dayOfWeek(d(2026, 11, 1))).toBe(6); // Sunday
    expect(dayOfWeek(d(1969, 12, 31))).toBe(2); // Wednesday, before epoch
  });

  it('round-trips ISO strings', () => {
    expect(toIsoString(d(1972, 5, 9))).toBe('1972-05-09');
    expect(parseIsoDate('1972-05-09')).toEqual(d(1972, 5, 9));
    expect(parseIsoDate('1972-02-30')).toBeNull();
    expect(parseIsoDate('19.05.1972')).toBeNull();
  });

  it('reads the local calendar date from a JS Date', () => {
    expect(fromJsDate(new Date(2026, 9, 30, 23, 59))).toEqual(d(2026, 10, 30));
  });
});
