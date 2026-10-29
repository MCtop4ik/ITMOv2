import {
  ageOn,
  anniversaryInYear,
  isJubilee,
  nextBirthday,
  previousBirthday,
  sortByNextBirthday,
  recentBirthdays,
  todayBirthdays,
  upcomingBirthdays,
} from './birthday';

const d = (year: number, month: number, day: number) => ({ year, month, day });
const who = (fullName: string, birthDate: ReturnType<typeof d>) => ({ id: fullName, fullName, birthDate });

describe('anniversaryInYear', () => {
  it('moves 29 Feb to 28 Feb in non-leap years only', () => {
    expect(anniversaryInYear(d(2000, 2, 29), 2026)).toEqual(d(2026, 2, 28));
    expect(anniversaryInYear(d(2000, 2, 29), 2028)).toEqual(d(2028, 2, 29));
    expect(anniversaryInYear(d(1972, 5, 19), 2026)).toEqual(d(2026, 5, 19));
  });
});

describe('nextBirthday / previousBirthday', () => {
  const today = d(2026, 10, 30);
  it('returns today when the birthday is today', () => {
    expect(nextBirthday(d(1990, 10, 30), today)).toEqual(today);
  });
  it('rolls over the new year', () => {
    expect(nextBirthday(d(1990, 1, 5), d(2026, 12, 20))).toEqual(d(2027, 1, 5));
    expect(previousBirthday(d(1990, 12, 31), d(2027, 1, 2))).toEqual(d(2026, 12, 31));
  });
  it('previous is strictly before today', () => {
    expect(previousBirthday(d(1990, 10, 30), today)).toEqual(d(2025, 10, 30));
    expect(previousBirthday(d(1990, 10, 27), today)).toEqual(d(2026, 10, 27));
  });
});

describe('ageOn', () => {
  it('counts completed years', () => {
    expect(ageOn(d(1972, 5, 19), d(2026, 5, 18))).toBe(53);
    expect(ageOn(d(1972, 5, 19), d(2026, 5, 19))).toBe(54);
    expect(ageOn(d(2000, 2, 29), d(2026, 2, 28))).toBe(26);
    expect(ageOn(d(2000, 2, 29), d(2026, 2, 27))).toBe(25);
  });
});

describe('isJubilee', () => {
  it.each([[0, false], [5, true], [24, false], [25, true], [50, true], [51, false]])(
    'age %i → %s',
    (age, expected) => expect(isJubilee(age)).toBe(expected),
  );
});

describe('upcomingBirthdays', () => {
  const today = d(2026, 12, 20);
  const people = [
    who('Через 40', d(1990, 1, 29)),
    who('Через 16', d(1977, 1, 5)),
    who('Завтра Б', d(1980, 12, 21)),
    who('Завтра А', d(1981, 12, 21)),
    who('Сегодня', d(2000, 12, 20)),
  ];

  it('sorts by days, then by name, and limits the window', () => {
    const result = upcomingBirthdays(people, today, 30);
    expect(result.map((u) => u.person.fullName)).toEqual(['Сегодня', 'Завтра А', 'Завтра Б', 'Через 16']);
    expect(result[3]).toMatchObject({ daysUntil: 16, turningAge: 50, isJubilee: true, date: d(2027, 1, 5) });
  });

  it('finds today birthdays only', () => {
    expect(todayBirthdays(people, today).map((u) => u.turningAge)).toEqual([26]);
  });
});

describe('recentBirthdays', () => {
  const today = d(2026, 10, 30);
  it('lists birthdays within the last N days, most recent first', () => {
    const people = [
      who('3 дня', d(1990, 10, 27)),
      who('Вчера', d(1991, 10, 29)),
      who('10 дней', d(1990, 10, 20)),
      who('Сегодня', d(1990, 10, 30)),
      who('Родился вчера', d(2026, 10, 29)),
    ];
    const result = recentBirthdays(people, today, 7);
    expect(result.map((r) => [r.person.fullName, r.daysAgo, r.turnedAge])).toEqual([
      ['Вчера', 1, 35],
      ['3 дня', 3, 36],
    ]);
  });
});

describe('sortByNextBirthday', () => {
  it('orders by days until birthday, then by name', () => {
    const today = d(2026, 10, 30);
    const people = [who('Б', d(1990, 11, 2)), who('В', d(1980, 10, 31)), who('А', d(1970, 11, 2))];
    expect(sortByNextBirthday(people, today).map((p) => p.fullName)).toEqual(['В', 'А', 'Б']);
  });
});
