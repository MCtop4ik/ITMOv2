import { Celebrant } from './birthday';

/** Twelve lists (index 0 = January), each sorted by day of month, then by name. */
export function groupByMonth<T extends Celebrant>(people: readonly T[]): T[][] {
  const months: T[][] = Array.from({ length: 12 }, () => []);
  for (const p of people) months[p.birthDate.month - 1].push(p);
  for (const list of months) {
    list.sort((a, b) => a.birthDate.day - b.birthDate.day || a.fullName.localeCompare(b.fullName, 'ru'));
  }
  return months;
}
