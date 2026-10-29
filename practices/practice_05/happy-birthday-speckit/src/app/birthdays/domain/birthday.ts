import {
  CalendarDate,
  createCalendarDate,
  daysBetween,
  isLeapYear,
} from '../../shared/domain/calendar-date';

/** Anyone with a birthday: both Person and Friend fit. */
export interface Celebrant {
  readonly id: string;
  readonly fullName: string;
  readonly birthDate: CalendarDate;
}

export interface UpcomingBirthday<T extends Celebrant = Celebrant> {
  readonly person: T;
  readonly date: CalendarDate;
  readonly daysUntil: number;
  readonly turningAge: number;
  readonly isJubilee: boolean;
}

export interface RecentBirthday<T extends Celebrant = Celebrant> {
  readonly person: T;
  readonly date: CalendarDate;
  readonly daysAgo: number;
  readonly turnedAge: number;
}

/** The day the birthday is celebrated in `year`; 29 Feb becomes 28 Feb in non-leap years. */
export function anniversaryInYear(birth: CalendarDate, year: number): CalendarDate {
  const day = birth.month === 2 && birth.day === 29 && !isLeapYear(year) ? 28 : birth.day;
  return createCalendarDate(year, birth.month, day)!;
}

/** Nearest celebration on or after `today`. */
export function nextBirthday(birth: CalendarDate, today: CalendarDate): CalendarDate {
  const thisYear = anniversaryInYear(birth, today.year);
  return daysBetween(today, thisYear) >= 0 ? thisYear : anniversaryInYear(birth, today.year + 1);
}

/** Most recent celebration strictly before `today`. */
export function previousBirthday(birth: CalendarDate, today: CalendarDate): CalendarDate {
  const thisYear = anniversaryInYear(birth, today.year);
  return daysBetween(thisYear, today) > 0 ? thisYear : anniversaryInYear(birth, today.year - 1);
}

export function ageOn(birth: CalendarDate, date: CalendarDate): number {
  const celebrated = daysBetween(anniversaryInYear(birth, date.year), date) >= 0;
  return date.year - birth.year - (celebrated ? 0 : 1);
}

export function isJubilee(age: number): boolean {
  return age > 0 && age % 5 === 0;
}

export function toUpcoming<T extends Celebrant>(person: T, today: CalendarDate): UpcomingBirthday<T> {
  const date = nextBirthday(person.birthDate, today);
  const turningAge = date.year - person.birthDate.year;
  return {
    person,
    date,
    daysUntil: daysBetween(today, date),
    turningAge,
    isJubilee: isJubilee(turningAge),
  };
}

function byDaysThenName<T extends Celebrant>(a: UpcomingBirthday<T>, b: UpcomingBirthday<T>) {
  return a.daysUntil - b.daysUntil || a.person.fullName.localeCompare(b.person.fullName, 'ru');
}

/** Birthdays from today (0) through `windowDays` days ahead, nearest first. */
export function upcomingBirthdays<T extends Celebrant>(
  people: readonly T[],
  today: CalendarDate,
  windowDays: number,
): UpcomingBirthday<T>[] {
  return people
    .map((p) => toUpcoming(p, today))
    .filter((u) => u.daysUntil <= windowDays)
    .sort(byDaysThenName);
}

export function todayBirthdays<T extends Celebrant>(
  people: readonly T[],
  today: CalendarDate,
): UpcomingBirthday<T>[] {
  return upcomingBirthdays(people, today, 0);
}

/** Birthdays 1…`windowDays` days ago, most recent first. */
export function recentBirthdays<T extends Celebrant>(
  people: readonly T[],
  today: CalendarDate,
  windowDays: number,
): RecentBirthday<T>[] {
  return people
    .map((person) => {
      const date = previousBirthday(person.birthDate, today);
      return {
        person,
        date,
        daysAgo: daysBetween(date, today),
        turnedAge: date.year - person.birthDate.year,
      };
    })
    .filter((r) => r.daysAgo <= windowDays && r.turnedAge > 0)
    .sort((a, b) => a.daysAgo - b.daysAgo || a.person.fullName.localeCompare(b.person.fullName, 'ru'));
}

export function sortByNextBirthday<T extends Celebrant>(
  people: readonly T[],
  today: CalendarDate,
): T[] {
  const withDays = people.map((p) => ({ p, days: daysBetween(today, nextBirthday(p.birthDate, today)) }));
  return withDays
    .sort((a, b) => a.days - b.days || a.p.fullName.localeCompare(b.p.fullName, 'ru'))
    .map((x) => x.p);
}
