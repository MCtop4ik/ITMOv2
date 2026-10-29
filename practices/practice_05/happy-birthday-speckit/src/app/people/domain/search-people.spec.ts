import { createPerson } from './person';
import { sortByNextBirthday } from '../../birthdays/domain/birthday';
import { searchPeople, sortByName } from './search-people';

const people = [
  createPerson('Романова Марина Викторовна', { year: 1972, month: 5, day: 19 }),
  createPerson('Романова Марина Сергеевна', { year: 1986, month: 2, day: 20 }),
  createPerson('Семёнов Пётр', { year: 1990, month: 11, day: 1 }),
  createPerson('Алексеев Иван', { year: 1980, month: 10, day: 31 }),
];

describe('searchPeople', () => {
  const names = (q: string) => searchPeople(people, q).map((p) => p.fullName);

  it('finds by any word part, case-insensitively', () => {
    expect(names('романова')).toHaveLength(2);
    expect(names('ВИК')).toEqual(['Романова Марина Викторовна']);
  });

  it('requires all words in any order', () => {
    expect(names('марина вик')).toEqual(['Романова Марина Викторовна']);
    expect(names('вик  романова')).toEqual(['Романова Марина Викторовна']);
  });

  it('treats е and ё the same', () => {
    expect(names('семен')).toEqual(['Семёнов Пётр']);
    expect(names('сёмен')).toEqual(['Семёнов Пётр']);
  });

  it('returns everyone for a blank query and nobody for no match', () => {
    expect(searchPeople(people, '   ')).toBe(people);
    expect(names('зззз')).toEqual([]);
  });
});

describe('sorting', () => {
  it('sorts by name, then by birth date for namesakes', () => {
    const twins = [
      createPerson('Б Б', { year: 1990, month: 1, day: 2 }),
      createPerson('Б Б', { year: 1990, month: 1, day: 1 }),
      createPerson('Б Б', { year: 1989, month: 5, day: 1 }),
      createPerson('Б Б', { year: 1990, month: 2, day: 1 }),
      createPerson('А А', { year: 2000, month: 1, day: 1 }),
    ];
    expect(sortByName(twins).map((p) => `${p.fullName} ${p.id.split('|')[1]}`)).toEqual([
      'А А 2000-01-01',
      'Б Б 1989-05-01',
      'Б Б 1990-01-01',
      'Б Б 1990-01-02',
      'Б Б 1990-02-01',
    ]);
  });

  it('sorts by nearest birthday', () => {
    const today = { year: 2026, month: 10, day: 30 };
    expect(sortByNextBirthday(people, today).map((p) => p.lastName)).toEqual([
      'Алексеев',
      'Семёнов',
      'Романова',
      'Романова',
    ]);
  });
});
