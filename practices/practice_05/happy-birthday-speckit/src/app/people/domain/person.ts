import { CalendarDate, toIsoString } from '../../shared/domain/calendar-date';

/** `normalizeName(fullName) + '|' + YYYY-MM-DD`; shared by Person and Friend. */
export type PersonId = string;

export interface Person {
  readonly id: PersonId;
  readonly lastName: string;
  readonly firstName: string | null;
  readonly patronymic: string | null;
  readonly fullName: string;
  readonly birthDate: CalendarDate;
  readonly searchKey: string;
}

/** Lowercase, `ё→е`, single spaces: the form used for search and identity. */
export function normalizeName(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();
}

export function personId(fullName: string, birthDate: CalendarDate): PersonId {
  return `${normalizeName(fullName)}|${toIsoString(birthDate)}`;
}

/** `fullName` must be non-blank; words beyond the third go into the patronymic. */
export function createPerson(fullName: string, birthDate: CalendarDate): Person {
  const words = fullName.trim().split(/\s+/);
  const cleanName = words.join(' ');
  const searchKey = normalizeName(cleanName);
  return {
    id: `${searchKey}|${toIsoString(birthDate)}`,
    lastName: words[0],
    firstName: words[1] ?? null,
    patronymic: words.length > 2 ? words.slice(2).join(' ') : null,
    fullName: cleanName,
    birthDate,
    searchKey,
  };
}
