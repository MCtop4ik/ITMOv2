# Data Model: Напоминалка о днях рождения

Все сущности — доменный слой, чистый TypeScript, неизменяемые (`readonly`). Функции получают
«сегодня» параметром `today: CalendarDate`.

## Shared kernel (`src/app/shared/domain`)

### CalendarDate (value object)

| Поле | Тип | Правила |
|---|---|---|
| year | number | 1000–9999 |
| month | number | 1–12 |
| day | number | 1–число дней в месяце (с учётом високосного года) |

Функции: `createCalendarDate(y, m, d) → CalendarDate | null` (валидация),
`isLeapYear(y)`, `daysInMonth(y, m)`, `epochDay(date)`, `daysBetween(a, b)`,
`compareDates(a, b)`, `addDays(date, n)`, `dayOfWeek(date) → 0..6 (пн=0)`, `toIsoString(date)`.

### Русские форматтеры

`pluralRu(n, ['день','дня','дней'])`, `formatDayMonth(date) → «19 мая»`,
`weekdayName(i) → «понедельник»`, `formatDaysUntil(n) → «сегодня» | «завтра» | «через N дней»`,
`formatDaysAgo(n) → «вчера» | «N дней назад»`.

## Контекст People (`src/app/people`)

### Person (entity)

| Поле | Тип | Правила |
|---|---|---|
| id | PersonId (string) | `normalizeName(fullName) + '|' + toIsoString(birthDate)` |
| lastName | string | первое слово ФИО |
| firstName | string \| null | второе слово |
| patronymic | string \| null | третье слово; при >3 слов — остаток через пробел |
| fullName | string | ФИО как в файле, с одиночными пробелами |
| birthDate | CalendarDate | не в будущем относительно даты импорта |
| searchKey | string | `normalizeName(fullName)`: нижний регистр, `ё→е`, одиночные пробелы |

### ImportResult (value object)

| Поле | Тип |
|---|---|
| people | readonly Person[] (без дубликатов) |
| skipped | readonly SkippedLine[] |
| duplicatesMerged | number |

**SkippedLine**: `{ lineNumber: number; text: string; reason: SkipReason }`,
`SkipReason = 'format' | 'invalid-date' | 'future-date'`.

Функции: `parseLine(text, today) → Person | SkipReason | 'empty'`,
`parsePeopleFile(text, today) → ImportResult`, `normalizeName(s)`,
`searchPeople(people, query) → Person[]`, `sortByName(people)`.

## Контекст Birthdays (`src/app/birthdays`)

### UpcomingBirthday (value object, вычисляемый)

| Поле | Тип | Правила |
|---|---|---|
| person | Person \| Friend | |
| date | CalendarDate | ближайшая годовщина ≥ today; 29.02 → 28.02 в невисокосный год |
| daysUntil | number | 0 = сегодня |
| turningAge | number | `date.year - birthDate.year` |
| isJubilee | boolean | `turningAge > 0 && turningAge % 5 === 0` |

### RecentBirthday (value object, вычисляемый)

`{ person, date, daysAgo (1..7), turnedAge }`.

Функции: `anniversaryInYear(birth, year)`, `nextBirthday(birth, today)`, `ageOn(birth, date)`,
`isJubilee(age)`, `upcomingBirthdays(list, today, windowDays) → UpcomingBirthday[]`
(сортировка по daysUntil, затем по имени), `todayBirthdays(list, today)`,
`recentBirthdays(list, today, 7)`, `zodiacSign(birth) → ZodiacSign`,
`groupByMonth(list) → 12 списков, отсортированных по дню`,
`buildGreeting(person, upcoming) → string`, `sampleRandom(list, n, rng)`.

**ZodiacSign**: перечисление 12 знаков с русским названием и диапазоном дат.

**Greeting**: обращение `Имя Отчество` (или `Имя`, или ФИО, если имени нет);
обычный шаблон «<Обращение>, с днём рождения! …»; юбилейный — «<Обращение>, с N-летием! …».

## Контекст Friends (`src/app/friends`)

### Friend (entity)

| Поле | Тип | Правила |
|---|---|---|
| id | PersonId | тот же алгоритм, что у Person — совпадение = «это друг» |
| fullName | string | копия на момент добавления |
| birthDate | CalendarDate | копия |
| addedAt | string (ISO datetime) | для отладки/сортировки |

### FriendList (aggregate)

Неизменяемый список `Friend` с уникальными `id`. Функции: `addFriend(list, person) → FriendList`
(идемпотентно), `removeFriend(list, id)`, `isFriend(list, id)`. Состояние: человек
**не друг ⇄ друг** (добавить / убрать). Не зависит от загруженного файла (FR-026).

## Контекст Statistics (`src/app/statistics`)

### FileStatistics (value object)

| Поле | Тип |
|---|---|
| totalPeople | number |
| friendsCount | number |
| todayCount | number |
| byMonth | number[12] |
| byAgeGroup | `{ label: string; count: number }[]` — до 18, 18–29, 30–39, 40–49, 50–59, 60–69, 70+ |
| topFirstNames / topLastNames | `{ name: string; count: number }[]` (≤10, по убыванию, при равенстве по алфавиту) |
| averageAge | number \| null (1 знак после запятой) |
| oldest / youngest | Person \| null (при равенстве даты — первый по алфавиту) |
| leapDayCount | number |
| mostCommonBirthday | `{ month, day, count } \| null` (при равенстве — раньше в году) |
| byZodiac | `{ sign: ZodiacSign; count: number }[12]` |

Функция: `computeStatistics(people, friendsCount, today) → FileStatistics` — один проход O(n)
плюс сортировка топов.

## Связи

```text
ImportResult 1──* Person ──(id совпадает)── Friend *──1 FriendList
Person | Friend ──> UpcomingBirthday / RecentBirthday (вычисляются от today)
Person[] ──> FileStatistics
```
