# Отчёт по фиче 001-birthday-reminder

**Дата**: 2026-10-30 · **Конституция**: принцип IV

## Итог проверок

| Проверка | Результат |
|---|---|
| `npm test` (`ng test --coverage`) | 13 файлов, 97 тестов, все зелёные |
| Покрытие `src/app/**/domain/**` | строки 100%, операторы 100%, функции 100%, ветви 99,32% (порог 81%) |
| `npm run build` | без ошибок и предупреждений, initial 290 kB (80 kB gzip) |
| Импорт 100 000 строк (dev-сборка) | 1,2 с (SC-007: ≤ 5 с) |
| Главная после перезагрузки | ≤ 0,4 с (SC-001: ≤ 2 с) |
| Поиск по 100 000 записей | ~33 мс на ввод, включая отрисовку (SC-003: < 300 мс) |
| Статистика по 100 000 записей | 76 мс (SC-008: ≤ 2 с) |
| Ширина 375px | горизонтальной прокрутки нет ни на одном экране |
| Консоль браузера | 0 ошибок, 0 предупреждений |

Единственная непокрытая ветвь: сравнение по имени при равных `daysAgo` в `recentBirthdays`
(`birthday.ts:109`).

## Shared kernel: `src/app/shared`

### domain/calendar-date.ts

| Имя | Что делает |
|---|---|
| `CalendarDate` (interface) | Дата без времени и часового пояса: год, месяц, день |
| `isLeapYear(year)` | Високосный ли год (правила 4/100/400) |
| `daysInMonth(year, month)` | Число дней в месяце с учётом февраля |
| `createCalendarDate(y, m, d)` | Создаёт дату или `null`, если её не существует (год 1000–9999) |
| `epochDay(date)` | Номер дня от 1970-01-01, база для арифметики дат |
| `fromEpochDay(days)` | Обратное преобразование номера дня в дату |
| `daysBetween(from, to)` | Разница в днях (может быть отрицательной) |
| `compareDates(a, b)` | Сравнение для сортировки |
| `addDays(date, n)` | Сдвиг даты на n дней |
| `dayOfWeek(date)` | День недели, 0 = понедельник |
| `toIsoString(date)` / `parseIsoDate(text)` | Перевод в `YYYY-MM-DD` и обратно, с проверкой |
| `fromJsDate(date)` | Граница с браузером: локальная дата из `Date` |

### domain/russian-format.ts

| Имя | Что делает |
|---|---|
| `pluralRu(n, forms)` | Выбирает форму слова: 1 день, 2 дня, 5 дней (с 11–14) |
| `monthName(month)` | «Май» (именительный падеж, для календаря) |
| `formatDayMonth(date)` | «19 мая» |
| `formatFullDate(date)` | «19 мая 1972» |
| `weekdayName(i)` | «понедельник» … «воскресенье» |
| `formatDays(n)` / `formatAge(age)` | «3 дня», «51 год» |
| `formatDaysUntil(n)` | «сегодня» / «завтра» / «через N дней» |
| `formatDaysAgo(n)` | «вчера» / «N дней назад» |

### domain/random.ts

| Имя | Что делает |
|---|---|
| `RandomSource` (type) | Генератор чисел [0, 1), передаётся параметром ради чистоты |
| `sampleRandom(items, n, random)` | До n разных элементов без повторов (частичный Фишер–Йетс) |

### application/clock.service.ts

| Имя | Что делает |
|---|---|
| `ClockService` | Signal `today`; сам переключается в полночь, пока вкладка открыта (FR-014) |

## Контекст People: `src/app/people`

### domain/person.ts

| Имя | Что делает |
|---|---|
| `PersonId` (type) | `нормализованное ФИО|YYYY-MM-DD`, общий для человека и друга |
| `Person` (interface) | Человек из файла: части ФИО, дата, ключ поиска |
| `normalizeName(text)` | Нижний регистр, `ё→е`, одиночные пробелы |
| `personId(fullName, date)` | Строит `PersonId` |
| `createPerson(fullName, date)` | Делит ФИО на фамилию/имя/отчество (лишние слова уходят в отчество) |

### domain/parse-people-file.ts

| Имя | Что делает |
|---|---|
| `SkipReason`, `SkippedLine`, `ImportResult`, `LineParseResult` | Результаты разбора |
| `parseLine(text, today)` | Разбирает одну строку: человек, пустая или причина пропуска |
| `parsePeopleFile(text, today)` | Разбирает файл, номера строк с 1, объединяет дубликаты |

### domain/search-people.ts

| Имя | Что делает |
|---|---|
| `searchPeople(people, query)` | Все слова запроса в любом порядке, без учёта регистра и е/ё |
| `sortByName(people)` | По алфавиту (русская сортировка), однофамильцы по дате рождения |

### application

| Имя | Что делает |
|---|---|
| `StoredFile`, `PeopleFileStore`, `PEOPLE_FILE_STORE` | Порт хранилища исходного файла |
| `PeopleStore` | Состояние списка: импорт, восстановление, очистка, статус, ошибки, сводка импорта |

### infrastructure

| Имя | Что делает |
|---|---|
| `decodeFileBytes(buffer)` | UTF-8, при ошибке Windows-1251 |
| `IndexedDbPeopleFileStore` | Реализация порта на IndexedDB (`happy-birthday` / `files` / `current`) |

### presentation

| Имя | Что делает |
|---|---|
| `FilePickerService` | Открывает системный выбор файла с любого экрана |
| `FileDropComponent` | Экран без файла: приглашение, кнопка, состояние загрузки, ошибка |
| `ImportSummaryComponent` | Диалог «Загружено / Пропущено / Дубликатов» со списком пропущенных строк (до 200) |
| `PeoplePage` | «Все люди»: поиск, две сортировки, виртуальная прокрутка, кнопка «В друзья» |
| `PersonCardPage` | Карточка: возраст, день недели и зодиак, копирование поздравления; при отсутствии в файле берёт данные друга |

## Контекст Birthdays: `src/app/birthdays`

### domain/birthday.ts

| Имя | Что делает |
|---|---|
| `Celebrant`, `UpcomingBirthday`, `RecentBirthday` | Общие типы именинника и рассчитанных праздников |
| `anniversaryInYear(birth, year)` | Дата праздника в году; 29.02 → 28.02 в невисокосный год |
| `nextBirthday` / `previousBirthday` | Ближайший праздник (с сегодня) / прошедший (строго до сегодня) |
| `ageOn(birth, date)` | Полных лет на дату |
| `isJubilee(age)` | Кратен 5 и больше 0 |
| `toUpcoming(person, today)` | Дата, дни до праздника, возраст, юбилей |
| `upcomingBirthdays(list, today, window)` | Праздники в окне 0…window дней, по дням и имени |
| `todayBirthdays(list, today)` | Только сегодняшние |
| `recentBirthdays(list, today, window)` | Прошедшие за 1…window дней, свежие первыми |
| `sortByNextBirthday(list, today)` | Сортировка по ближайшему празднику |

### domain/zodiac.ts, greeting.ts, month-calendar.ts

| Имя | Что делает |
|---|---|
| `ZodiacSign`, `ZODIAC_SIGNS` | 12 знаков с датой начала |
| `zodiacSign(birth)` | Знак по дню и месяцу (Козерог переходит через Новый год) |
| `addressName(fullName)` | «Имя Отчество» / «Имя» / фамилия |
| `buildGreeting(fullName, age)` | Текст поздравления; для юбилея «с N-летием!» |
| `groupByMonth(list)` | 12 списков по дням месяца |

### application / presentation

| Имя | Что делает |
|---|---|
| `BirthdaysFacade` | Сегодня / ближайшие / недавние / ближайший для друзей; период 7/30/90 сохраняется |
| `UPCOMING_WINDOWS`, `UpcomingWindow` | Допустимые периоды |
| `HomePage` | Главная: «Сегодня» (инверсный блок), «Ближайшие», «Недавно были», пустое состояние с каруселью |
| `BirthdayRowComponent` | Строка праздника с квадратным блоком даты (фирменный мотив) |
| `FriendsCarouselComponent` | Две встречные ленты случайных людей; пауза при наведении и фокусе; статично при reduced motion |
| `CalendarPage` | 12 месяцев со счётчиками и список месяца с виртуальной прокруткой |

## Контекст Friends: `src/app/friends`

| Имя | Слой | Что делает |
|---|---|---|
| `Friend`, `FriendList`, `StoredFriend` | domain | Друг с собственной копией ФИО и даты |
| `friendFromPerson`, `isFriend`, `addFriend`, `removeFriend` | domain | Неизменяемые операции; добавление идемпотентно |
| `toStoredFriends`, `parseStoredFriends` | domain | Сериализация; при чтении отбрасываются битые записи |
| `FriendStore`, `FRIEND_STORE` | application | Порт хранилища друзей |
| `FriendsStore` | application | Signals `friends`, `ids`; `add`, `remove`, `toggle`, `has` |
| `LocalStorageFriendStore` | infrastructure | Реализация на localStorage (`happy-birthday.friends.v1`) |
| `FriendsPage` | presentation | «Мои друзья»: алфавит, дата, дни до праздника, «Убрать» |

## Контекст Statistics: `src/app/statistics`

| Имя | Слой | Что делает |
|---|---|---|
| `FileStatistics`, `NameCount` | domain | Набор показателей FR-027 |
| `computeStatistics(people, friendsCount, today)` | domain | Один проход по списку; детерминированные правила при равенстве |
| `StatsPage` | presentation | Итоги, полосы по месяцам и возрастам, топ-10, факты, зодиак |

## Оболочка и прочее

| Имя | Что делает |
|---|---|
| `App` (`src/app/app.ts`) | Шапка с вкладками, «Загрузить / Заменить файл», перетаскивание файла в окно, предупреждения |
| `routes` (`app.routes.ts`) | 7 маршрутов с ленивой загрузкой, `**` → главная |
| `appConfig` (`app.config.ts`) | Локаль `ru`, привязка порт → адаптер, восстановление списка при старте |
| `scripts/generate-people.mjs` | Тестовый файл на 100 000 строк с граничными случаями |

## Отклонения от плана

- Шрифты из DESIGN.md (Archivo Black, Work Sans, Space Mono) не поддерживают кириллицу.
  Используются замены, близкие по характеру: Dela Gothic One, Golos Text, IBM Plex Mono.
  **Нужно подтверждение владельца.**
- `id` друга не хранится, а вычисляется при чтении (`contracts/storage.md` обновлён).
- Функция `sortByNextBirthday` перенесена из `people` в `birthdays`, чтобы `people` не зависел от `birthdays`.
