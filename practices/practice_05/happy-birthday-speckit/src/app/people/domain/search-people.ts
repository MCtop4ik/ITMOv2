import { CalendarDate } from '../../shared/domain/calendar-date';
import { Person, normalizeName } from './person';

/** All query words must appear in the name, in any order; е/ё and case are ignored. */
export function searchPeople(people: readonly Person[], query: string): readonly Person[] {
  const words = normalizeName(query).split(' ').filter(Boolean);
  if (words.length === 0) return people;
  return people.filter((p) => words.every((w) => p.searchKey.includes(w)));
}

const collator = new Intl.Collator('ru');

export function sortByName<T extends { fullName: string; birthDate: CalendarDate }>(
  people: readonly T[],
): T[] {
  return [...people].sort(
    (a, b) =>
      collator.compare(a.fullName, b.fullName) ||
      a.birthDate.year - b.birthDate.year ||
      a.birthDate.month - b.birthDate.month ||
      a.birthDate.day - b.birthDate.day,
  );
}
