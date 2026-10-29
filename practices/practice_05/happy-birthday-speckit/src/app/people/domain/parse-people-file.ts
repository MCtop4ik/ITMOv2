import { CalendarDate, compareDates, createCalendarDate } from '../../shared/domain/calendar-date';
import { Person, createPerson } from './person';

export type SkipReason = 'format' | 'invalid-date' | 'future-date';

export interface SkippedLine {
  readonly lineNumber: number;
  readonly text: string;
  readonly reason: SkipReason;
}

export interface ImportResult {
  readonly people: readonly Person[];
  readonly skipped: readonly SkippedLine[];
  readonly duplicatesMerged: number;
}

export type LineParseResult =
  | { readonly kind: 'person'; readonly person: Person }
  | { readonly kind: 'skip'; readonly reason: SkipReason }
  | { readonly kind: 'empty' };

const LINE_PATTERN = /^\s*([^\s()|\d][^()|\d]*?)\s*\((\d{2})\.(\d{2})\.(\d{4})\)\s*\|?\s*$/u;

export function parseLine(text: string, today: CalendarDate): LineParseResult {
  if (text.trim() === '') return { kind: 'empty' };
  const match = LINE_PATTERN.exec(text);
  if (!match) return { kind: 'skip', reason: 'format' };
  const birthDate = createCalendarDate(+match[4], +match[3], +match[2]);
  if (!birthDate) return { kind: 'skip', reason: 'invalid-date' };
  if (compareDates(birthDate, today) > 0) return { kind: 'skip', reason: 'future-date' };
  return { kind: 'person', person: createPerson(match[1], birthDate) };
}

export function parsePeopleFile(text: string, today: CalendarDate): ImportResult {
  const byId = new Map<string, Person>();
  const skipped: SkippedLine[] = [];
  let duplicatesMerged = 0;
  text.split(/\r?\n/).forEach((line, index) => {
    const result = parseLine(line, today);
    if (result.kind === 'skip') {
      skipped.push({ lineNumber: index + 1, text: line, reason: result.reason });
    } else if (result.kind === 'person') {
      if (byId.has(result.person.id)) duplicatesMerged++;
      else byId.set(result.person.id, result.person);
    }
  });
  return { people: [...byId.values()], skipped, duplicatesMerged };
}
