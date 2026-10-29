import { groupByMonth } from './month-calendar';

const who = (fullName: string, month: number, day: number) => ({
  id: fullName,
  fullName,
  birthDate: { year: 1990, month, day },
});

describe('groupByMonth', () => {
  it('groups into 12 months sorted by day, then name', () => {
    const months = groupByMonth([who('В', 5, 20), who('Б', 5, 3), who('А', 5, 20), who('Г', 12, 1)]);
    expect(months).toHaveLength(12);
    expect(months[4].map((p) => p.fullName)).toEqual(['Б', 'А', 'В']);
    expect(months[11].map((p) => p.fullName)).toEqual(['Г']);
    expect(months[0]).toEqual([]);
  });
});
