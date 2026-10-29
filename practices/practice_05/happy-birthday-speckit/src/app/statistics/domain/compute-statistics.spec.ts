import { createPerson } from '../../people/domain/person';
import { computeStatistics } from './compute-statistics';

const today = { year: 2026, month: 10, day: 30 };
const p = (name: string, year: number, month: number, day: number) =>
  createPerson(name, { year, month, day });

describe('computeStatistics', () => {
  const people = [
    p('Романова Марина Викторовна', 1972, 5, 19),
    p('Романова Марина Сергеевна', 1986, 5, 19),
    p('Иванов Иван', 2010, 2, 29),
    p('Петров Пётр', 1950, 10, 30),
    p('Анна', 1950, 10, 30),
    p('Сидорова Анна', 2000, 1, 7),
  ];
  const stats = computeStatistics(people, 2, today);

  it('counts totals, friends and today birthdays', () => {
    expect(stats.totalPeople).toBe(6);
    expect(stats.friendsCount).toBe(2);
    expect(stats.todayCount).toBe(2);
  });

  it('distributes by month and age group', () => {
    expect(stats.byMonth[4]).toBe(2);
    expect(stats.byMonth[9]).toBe(2);
    expect(stats.byMonth.reduce((a, b) => a + b)).toBe(6);
    expect(stats.byAgeGroup).toEqual([
      { label: 'до 18', count: 1 },
      { label: '18–29', count: 1 },
      { label: '30–39', count: 0 },
      { label: '40–49', count: 1 },
      { label: '50–59', count: 1 },
      { label: '60–69', count: 0 },
      { label: '70+', count: 2 },
    ]);
  });

  it('ranks names by count, then alphabetically', () => {
    expect(stats.topFirstNames.slice(0, 3)).toEqual([
      { name: 'Марина', count: 2 },
      { name: 'Анна', count: 1 },
      { name: 'Иван', count: 1 },
    ]);
    expect(stats.topLastNames[0]).toEqual({ name: 'Романова', count: 2 });
  });

  it('computes ages, extremes and facts with deterministic ties', () => {
    // ages: 54, 40, 16, 76, 76, 26 → 288 / 6 = 48
    expect(stats.averageAge).toBe(48);
    expect(stats.oldest?.fullName).toBe('Анна');
    expect(stats.youngest?.fullName).toBe('Иванов Иван');
    expect(stats.leapDayCount).toBe(1);
    // 19 May and 30 Oct both have 2 people; the earlier date in the year wins.
    expect(stats.mostCommonBirthday).toEqual({ month: 5, day: 19, count: 2 });
    expect(stats.byZodiac.find((z) => z.sign.name === 'Телец')?.count).toBe(2);
    expect(stats.byZodiac.reduce((a, z) => a + z.count, 0)).toBe(6);
  });

  it('breaks youngest ties alphabetically', () => {
    const twins = [p('Яковлев Ян', 2020, 1, 1), p('Абрамов Ян', 2020, 1, 1)];
    expect(computeStatistics(twins, 0, today).youngest?.fullName).toBe('Абрамов Ян');
  });

  it('handles an empty list', () => {
    const empty = computeStatistics([], 0, today);
    expect(empty.averageAge).toBeNull();
    expect(empty.oldest).toBeNull();
    expect(empty.mostCommonBirthday).toBeNull();
    expect(empty.topFirstNames).toEqual([]);
  });
});
