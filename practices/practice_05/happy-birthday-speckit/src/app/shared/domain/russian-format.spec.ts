import {
  formatAge,
  formatDayMonth,
  formatDays,
  formatDaysAgo,
  formatDaysUntil,
  formatFullDate,
  monthName,
  pluralRu,
  weekdayName,
} from './russian-format';

describe('russian-format', () => {
  const forms = ['день', 'дня', 'дней'] as const;

  it.each([
    [1, 'день'], [2, 'дня'], [4, 'дня'], [5, 'дней'], [11, 'дней'], [12, 'дней'],
    [14, 'дней'], [21, 'день'], [22, 'дня'], [25, 'дней'], [101, 'день'], [111, 'дней'], [0, 'дней'],
  ])('pluralRu(%i) → %s', (n, expected) => {
    expect(pluralRu(n, forms)).toBe(expected);
  });

  it('formats dates in genitive', () => {
    expect(formatDayMonth({ month: 5, day: 19 })).toBe('19 мая');
    expect(formatDayMonth({ month: 1, day: 1 })).toBe('1 января');
    expect(formatFullDate({ year: 1972, month: 12, day: 31 })).toBe('31 декабря 1972');
  });

  it('names months and weekdays', () => {
    expect(monthName(5)).toBe('Май');
    expect(weekdayName(0)).toBe('понедельник');
    expect(weekdayName(6)).toBe('воскресенье');
  });

  it('formats counts with correct declension', () => {
    expect(formatDays(3)).toBe('3 дня');
    expect(formatAge(51)).toBe('51 год');
    expect(formatAge(54)).toBe('54 года');
    expect(formatAge(50)).toBe('50 лет');
  });

  it('formats relative days', () => {
    expect(formatDaysUntil(0)).toBe('сегодня');
    expect(formatDaysUntil(1)).toBe('завтра');
    expect(formatDaysUntil(5)).toBe('через 5 дней');
    expect(formatDaysUntil(22)).toBe('через 22 дня');
    expect(formatDaysAgo(1)).toBe('вчера');
    expect(formatDaysAgo(3)).toBe('3 дня назад');
    expect(formatDaysAgo(7)).toBe('7 дней назад');
  });
});
