import { createPerson, normalizeName, personId } from './person';

const birth = { year: 1972, month: 5, day: 19 };

describe('person', () => {
  it('normalizes names for search and identity', () => {
    expect(normalizeName('  Семён   ПЁТРОВ ')).toBe('семен петров');
  });

  it('splits a three-word name', () => {
    const p = createPerson('Романова Марина Викторовна', birth);
    expect(p).toMatchObject({
      lastName: 'Романова',
      firstName: 'Марина',
      patronymic: 'Викторовна',
      fullName: 'Романова Марина Викторовна',
      id: 'романова марина викторовна|1972-05-19',
      searchKey: 'романова марина викторовна',
    });
  });

  it('handles a name without patronymic and with extra words', () => {
    expect(createPerson('Иванов Иван', birth).patronymic).toBeNull();
    expect(createPerson('Иванов', birth).firstName).toBeNull();
    expect(createPerson('Оглы Рашид Ахмед оглы', birth).patronymic).toBe('Ахмед оглы');
  });

  it('collapses whitespace in the stored name', () => {
    expect(createPerson('  Иванов   Иван ', birth).fullName).toBe('Иванов Иван');
  });

  it('builds the same id regardless of case, ё and spacing', () => {
    expect(personId('СЕМЁН  Петров', birth)).toBe(createPerson('Семен Петров', birth).id);
  });
});
