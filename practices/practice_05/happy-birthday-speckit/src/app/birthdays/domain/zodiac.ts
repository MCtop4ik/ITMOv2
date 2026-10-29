import { CalendarDate } from '../../shared/domain/calendar-date';

export interface ZodiacSign {
  readonly name: string;
  /** First day of the sign: [month, day]. */
  readonly start: readonly [number, number];
}

/** Ordered by start within the year; Capricorn (22 Dec – 19 Jan) wraps around. */
export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  { name: 'Водолей', start: [1, 20] },
  { name: 'Рыбы', start: [2, 19] },
  { name: 'Овен', start: [3, 21] },
  { name: 'Телец', start: [4, 20] },
  { name: 'Близнецы', start: [5, 21] },
  { name: 'Рак', start: [6, 21] },
  { name: 'Лев', start: [7, 23] },
  { name: 'Дева', start: [8, 23] },
  { name: 'Весы', start: [9, 23] },
  { name: 'Скорпион', start: [10, 24] },
  { name: 'Стрелец', start: [11, 23] },
  { name: 'Козерог', start: [12, 22] },
];

export function zodiacSign(birth: Pick<CalendarDate, 'month' | 'day'>): ZodiacSign {
  const key = birth.month * 100 + birth.day;
  let sign = ZODIAC_SIGNS[ZODIAC_SIGNS.length - 1];
  for (const s of ZODIAC_SIGNS) {
    if (key >= s.start[0] * 100 + s.start[1]) sign = s;
  }
  return sign;
}
