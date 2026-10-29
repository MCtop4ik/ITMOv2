import { CalendarDate } from './calendar-date';

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const WEEKDAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];

/** Picks the Russian plural form: [1 день, 2 дня, 5 дней]. */
export function pluralRu(n: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(n);
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

const DAY_FORMS = ['день', 'дня', 'дней'] as const;
const YEAR_FORMS = ['год', 'года', 'лет'] as const;

export function monthName(month: number): string {
  return MONTHS_NOMINATIVE[month - 1];
}

export function formatDayMonth(date: Pick<CalendarDate, 'month' | 'day'>): string {
  return `${date.day} ${MONTHS_GENITIVE[date.month - 1]}`;
}

export function formatFullDate(date: CalendarDate): string {
  return `${formatDayMonth(date)} ${date.year}`;
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayName(index: number): string {
  return WEEKDAYS[index];
}

export function formatDays(n: number): string {
  return `${n} ${pluralRu(n, DAY_FORMS)}`;
}

export function formatAge(age: number): string {
  return `${age} ${pluralRu(age, YEAR_FORMS)}`;
}

export function formatDaysUntil(days: number): string {
  if (days === 0) return 'сегодня';
  if (days === 1) return 'завтра';
  return `через ${formatDays(days)}`;
}

export function formatDaysAgo(days: number): string {
  return days === 1 ? 'вчера' : `${formatDays(days)} назад`;
}
