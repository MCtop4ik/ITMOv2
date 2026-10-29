import { CalendarDate, compareDates } from '../../shared/domain/calendar-date';
import { anniversaryInYear, ageOn } from '../../birthdays/domain/birthday';
import { ZODIAC_SIGNS, ZodiacSign, zodiacSign } from '../../birthdays/domain/zodiac';
import { Person } from '../../people/domain/person';

export interface NameCount {
  readonly name: string;
  readonly count: number;
}

export interface FileStatistics {
  readonly totalPeople: number;
  readonly friendsCount: number;
  readonly todayCount: number;
  readonly byMonth: readonly number[];
  readonly byAgeGroup: readonly { readonly label: string; readonly count: number }[];
  readonly topFirstNames: readonly NameCount[];
  readonly topLastNames: readonly NameCount[];
  readonly averageAge: number | null;
  readonly oldest: Person | null;
  readonly youngest: Person | null;
  readonly leapDayCount: number;
  readonly mostCommonBirthday: { readonly month: number; readonly day: number; readonly count: number } | null;
  readonly byZodiac: readonly { readonly sign: ZodiacSign; readonly count: number }[];
}

/** Upper age bound (exclusive) per group; the last group is open-ended. */
const AGE_GROUPS: readonly { label: string; below: number }[] = [
  { label: 'до 18', below: 18 },
  { label: '18–29', below: 30 },
  { label: '30–39', below: 40 },
  { label: '40–49', below: 50 },
  { label: '50–59', below: 60 },
  { label: '60–69', below: 70 },
  { label: '70+', below: Infinity },
];

const TOP_SIZE = 10;

function topCounts(counts: Map<string, number>): NameCount[] {
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'))
    .slice(0, TOP_SIZE);
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function mostCommonDay(byDay: Map<number, number>): FileStatistics['mostCommonBirthday'] {
  let best: [number, number] | null = null;
  for (const entry of byDay) {
    if (!best || entry[1] > best[1] || (entry[1] === best[1] && entry[0] < best[0])) best = entry;
  }
  return best && { month: Math.floor(best[0] / 100), day: best[0] % 100, count: best[1] };
}

/** Earlier birth date wins for oldest; ties go to the alphabetically first name. */
function isOlder(a: Person, b: Person): boolean {
  return compareDates(a.birthDate, b.birthDate) < 0 ||
    (compareDates(a.birthDate, b.birthDate) === 0 && a.fullName.localeCompare(b.fullName, 'ru') < 0);
}

function isYounger(a: Person, b: Person): boolean {
  return compareDates(a.birthDate, b.birthDate) > 0 ||
    (compareDates(a.birthDate, b.birthDate) === 0 && a.fullName.localeCompare(b.fullName, 'ru') < 0);
}

export function computeStatistics(
  people: readonly Person[],
  friendsCount: number,
  today: CalendarDate,
): FileStatistics {
  const byMonth = new Array<number>(12).fill(0);
  const byAgeGroup = new Array<number>(AGE_GROUPS.length).fill(0);
  const byZodiac = new Map<ZodiacSign, number>(ZODIAC_SIGNS.map((s) => [s, 0]));
  const firstNames = new Map<string, number>();
  const lastNames = new Map<string, number>();
  const byDay = new Map<number, number>();
  let todayCount = 0;
  let ageSum = 0;
  let leapDayCount = 0;
  let oldest: Person | null = null;
  let youngest: Person | null = null;

  for (const p of people) {
    const { month, day } = p.birthDate;
    const age = ageOn(p.birthDate, today);
    byMonth[month - 1]++;
    byAgeGroup[AGE_GROUPS.findIndex((g) => age < g.below)]++;
    const sign = zodiacSign(p.birthDate);
    byZodiac.set(sign, byZodiac.get(sign)! + 1);
    increment(lastNames, p.lastName);
    if (p.firstName) increment(firstNames, p.firstName);
    byDay.set(month * 100 + day, (byDay.get(month * 100 + day) ?? 0) + 1);
    if (compareDates(anniversaryInYear(p.birthDate, today.year), today) === 0) todayCount++;
    if (month === 2 && day === 29) leapDayCount++;
    ageSum += age;
    if (!oldest || isOlder(p, oldest)) oldest = p;
    if (!youngest || isYounger(p, youngest)) youngest = p;
  }

  return {
    totalPeople: people.length,
    friendsCount,
    todayCount,
    byMonth,
    byAgeGroup: AGE_GROUPS.map((g, i) => ({ label: g.label, count: byAgeGroup[i] })),
    topFirstNames: topCounts(firstNames),
    topLastNames: topCounts(lastNames),
    averageAge: people.length ? Math.round((ageSum / people.length) * 10) / 10 : null,
    oldest,
    youngest,
    leapDayCount,
    mostCommonBirthday: mostCommonDay(byDay),
    byZodiac: ZODIAC_SIGNS.map((sign) => ({ sign, count: byZodiac.get(sign)! })),
  };
}
