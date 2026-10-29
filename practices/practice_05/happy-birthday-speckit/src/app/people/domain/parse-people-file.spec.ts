import { parseLine, parsePeopleFile } from './parse-people-file';

const today = { year: 2026, month: 10, day: 30 };

describe('parseLine', () => {
  it('parses the canonical format', () => {
    const r = parseLine('Романова Марина Викторовна (19.05.1972)|', today);
    expect(r.kind).toBe('person');
    if (r.kind === 'person') {
      expect(r.person.fullName).toBe('Романова Марина Викторовна');
      expect(r.person.birthDate).toEqual({ year: 1972, month: 5, day: 19 });
    }
  });

  it('tolerates missing bar and extra spaces', () => {
    const r = parseLine('  Романова   Марина Викторовна (19.05.1972)  ', today);
    expect(r.kind === 'person' && r.person.fullName).toBe('Романова Марина Викторовна');
  });

  it('accepts hyphens, apostrophes and Latin letters', () => {
    expect(parseLine("Салтыков-Щедрин O'Neil (01.01.1990)|", today).kind).toBe('person');
  });

  it('treats blank lines as empty', () => {
    expect(parseLine('   ', today)).toEqual({ kind: 'empty' });
    expect(parseLine('', today)).toEqual({ kind: 'empty' });
  });

  it.each([
    ['Иванов Иван 01.01.1990', 'format'],
    ['(01.01.1990)|', 'format'],
    ['   (01.01.1990)|', 'format'],
    ['Иванов (1.1.1990)|', 'format'],
    ['Иванов 2 (01.01.1990)|', 'format'],
    ['Иванов (31.02.1990)|', 'invalid-date'],
    ['Иванов (00.13.2000)|', 'invalid-date'],
    ['Иванов (01.01.2027)|', 'future-date'],
  ])('skips %s with reason %s', (line, reason) => {
    expect(parseLine(line, today)).toEqual({ kind: 'skip', reason });
  });

  it('accepts a birthday that is today', () => {
    expect(parseLine('Иванов (30.10.2026)|', today).kind).toBe('person');
  });
});

describe('parsePeopleFile', () => {
  it('collects people, skipped lines with 1-based numbers, and merged duplicates', () => {
    const text = [
      'Романова Марина Викторовна (19.05.1972)|',
      '',
      'мусор',
      'РОМАНОВА  марина викторовна (19.05.1972)|',
      'Романова Марина Сергеевна (20.02.1986)|',
    ].join('\r\n');
    const result = parsePeopleFile(text, today);
    expect(result.people.map((p) => p.fullName)).toEqual([
      'Романова Марина Викторовна',
      'Романова Марина Сергеевна',
    ]);
    expect(result.skipped).toEqual([{ lineNumber: 3, text: 'мусор', reason: 'format' }]);
    expect(result.duplicatesMerged).toBe(1);
  });

  it('returns an empty result for an empty file', () => {
    expect(parsePeopleFile('', today)).toEqual({ people: [], skipped: [], duplicatesMerged: 0 });
  });
});
