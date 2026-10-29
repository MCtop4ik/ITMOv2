---
description: "Task list for 001-birthday-reminder"
---

# Tasks: Напоминалка о днях рождения

**Input**: Design documents from `/specs/001-birthday-reminder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: обязательны для всех чистых функций домена (Constitution III, покрытие `**/domain/**` > 80%).
Тест пишется рядом с кодом (`*.spec.ts`) до или вместе с реализацией.

**UI direction**: `DESIGN.md` (RawBlock): 0px radius, без теней, рамки 3/5px, чёрный/белый,
синий только для ссылок, Archivo Black / Work Sans / Space Mono. antislop — режим DURING.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Create Angular 22 project in repo root (`ng new happy-birthday --directory . --style=css --routing --ssr=false --skip-git`), keep `specs/`, `idea.md`, `DESIGN.md`
- [X] T002 Add `@angular/cdk` and `@vitest/coverage-v8`; configure `test` target in `angular.json` with coverage include `src/app/**/domain/**/*.ts`, exclude `*.spec.ts`, thresholds 81 (fallback: `runnerConfig` vitest config)
- [X] T003 [P] Configure `src/app/app.config.ts`: router, zoneless, `LOCALE_ID` `'ru'` with `registerLocaleData(localeRu)`
- [X] T004 [P] Global RawBlock styles in `src/styles.css` (CSS variables for colors, fonts, spacing, borders; visible focus; `prefers-reduced-motion`) and Google Fonts links in `src/index.html`; `lang="ru"`

## Phase 2: Foundational (shared kernel + people import + friends core)

- [X] T005 [P] `CalendarDate` and functions `createCalendarDate` (year 1000–9999, month 1–12, day 1–daysInMonth), `isLeapYear`, `daysInMonth`, `epochDay`, `daysBetween`, `compareDates`, `addDays`, `dayOfWeek` (пн=0), `toIsoString`, `parseIsoDate`, `fromJsDate` in `src/app/shared/domain/calendar-date.ts` + spec
- [X] T006 [P] Russian formatters `pluralRu`, `formatDayMonth` («19 мая»), `formatFullDate`, `weekdayName`, `monthName`, `formatDaysUntil`, `formatDaysAgo`, `formatAge` in `src/app/shared/domain/russian-format.ts` + spec
- [X] T007 [P] `sampleRandom(list, n, rng)` in `src/app/shared/domain/random.ts` + spec
- [X] T008 `ClockService` (signal `today: CalendarDate`, re-schedules at midnight) in `src/app/shared/application/clock.service.ts`
- [X] T009 `Person`, `PersonId`, `normalizeName` (lowercase, `ё→е`, single spaces), `createPerson` in `src/app/people/domain/person.ts` + spec
- [X] T010 `parseLine`, `parsePeopleFile(text, today) → ImportResult` per contracts/input-file-format.md (reasons `format` | `invalid-date` | `future-date`, 1-based line numbers, dedupe → `duplicatesMerged`) in `src/app/people/domain/parse-people-file.ts` + spec
- [X] T011 [P] `decodeFileBytes(buffer)` UTF-8 fatal → windows-1251 fallback in `src/app/people/infrastructure/decode-file.ts`
- [X] T012 [P] `PeopleFileStore` port in `src/app/people/application/people-file-store.port.ts` and IndexedDB adapter (db `happy-birthday` v1, store `files`, key `current`) in `src/app/people/infrastructure/indexed-db-people-file-store.ts`
- [X] T013 `PeopleStore` (signals `people`, `importResult`, `status: 'empty'|'loading'|'ready'|'error'`, `persistent`; `importFile(file)`, `restore()`, `clear()`) in `src/app/people/application/people.store.ts`
- [X] T014 [P] `Friend`, `FriendList` functions `addFriend` (idempotent), `removeFriend`, `isFriend`, `friendFromPerson`, `parseStoredFriends` (skips invalid) in `src/app/friends/domain/friend-list.ts` + spec
- [X] T015 [P] `FriendStore` port + localStorage adapter (key `happy-birthday.friends.v1`) in `src/app/friends/application/friend-store.port.ts`, `src/app/friends/infrastructure/local-storage-friend-store.ts`
- [X] T016 `FriendsStore` (signal `friends`, `ids` set, `add`, `remove`, `toggle`, `has`) in `src/app/friends/application/friends.store.ts`
- [X] T017 Birthday math `anniversaryInYear` (29.02 → 28.02 in non-leap year), `nextBirthday`, `ageOn`, `isJubilee` (`age > 0 && age % 5 === 0`), `upcomingBirthdays(list, today, windowDays)`, `todayBirthdays`, `recentBirthdays(list, today, 7)` in `src/app/birthdays/domain/birthday.ts` + spec
- [X] T018 App shell: header with tabs (only existing routes), «Загрузить файл» button, window drag&drop, import summary dialog in `src/app/app.ts|html|css`, routes in `src/app/app.routes.ts`, `src/app/people/presentation/file-import/`

**Checkpoint**: файл импортируется, сохраняется, переживает перезагрузку.

## Phase 3: US1 — загрузка, друзья, «Сегодня» (P1) 🎯 MVP

**Independent Test**: загрузить файл, нажать в карусели на человека с ДР сегодня → он в «Сегодня».

- [X] T019 [US1] Empty-file landing (drop zone + file picker, loading and error states) in `src/app/people/presentation/file-import/file-drop.component.ts`
- [X] T020 [US1] Carousel of 20 random people (pause on hover/focus, reduced-motion fallback, click → add friend + confirmation) in `src/app/birthdays/presentation/friends-carousel/friends-carousel.component.ts`
- [X] T021 [US1] Home page with «Сегодня» block and no-friends state (CTA «Найти друзей» → `/people` + carousel) in `src/app/birthdays/presentation/home/home.page.ts`
- [X] T022 [US1] `BirthdaysFacade` (computed `today`, `upcoming`, `recent` from friends + clock) in `src/app/birthdays/application/birthdays.facade.ts`

## Phase 4: US1a — «Мои друзья» (P1)

- [X] T023 [US1a] Friends page sorted by name with date, days until birthday, «Убрать» in `src/app/friends/presentation/friends.page.ts`

## Phase 5: US2 — ближайшие и юбилеи (P1)

- [X] T024 [US2] «Ближайшие» block with period chips 7/30/90 (persist `happy-birthday.upcoming-window.v1`), «завтра»/«через N дней», age, «Юбилей» chip in `src/app/birthdays/presentation/home/`

## Phase 6: US3 — все люди и поиск (P2)

- [X] T025 [P] [US3] `searchPeople(people, query)` (all words, any order, е=ё, case-insensitive), `sortByName`, `sortByNextBirthday` in `src/app/people/domain/search-people.ts` + spec
- [X] T026 [US3] People page: search input, sort chips, CDK virtual scroll, friend toggle per row, «Никого не найдено» in `src/app/people/presentation/people-list/people.page.ts`

## Phase 7: US4 — недавно были (P2)

- [X] T027 [US4] «Недавно были» block («вчера» / «N дней назад», turned age) in `src/app/birthdays/presentation/home/`

## Phase 8: US5 — карточка и поздравление (P3)

- [X] T028 [P] [US5] `zodiacSign(birth)` with 12 signs in `src/app/birthdays/domain/zodiac.ts` + spec
- [X] T029 [P] [US5] `addressName(person)`, `buildGreeting(person, turningAge)` (jubilee → «с N-летием!») in `src/app/birthdays/domain/greeting.ts` + spec
- [X] T030 [US5] Person card `/people/:id` (falls back to friend data, «Человек не найден»), copy greeting via `navigator.clipboard` with «Скопировано» / error message in `src/app/people/presentation/person-card/person-card.page.ts`

## Phase 9: US6 — календарь (P3)

- [X] T031 [P] [US6] `groupByMonth(list)` in `src/app/birthdays/domain/month-calendar.ts` + spec
- [X] T032 [US6] Calendar page `/calendar` and `/calendar/:month` in `src/app/birthdays/presentation/calendar/calendar.page.ts`

## Phase 10: US7 — статистика (P3)

- [X] T033 [P] [US7] `computeStatistics(people, friendsCount, today)` per data-model FileStatistics (age groups до 18, 18–29, 30–39, 40–49, 50–59, 60–69, 70+; top 10 with alphabetical tie-break; mostCommonBirthday tie → earlier in year) in `src/app/statistics/domain/compute-statistics.ts` + spec
- [X] T034 [US7] Stats page `/stats` in `src/app/statistics/presentation/stats.page.ts`

## Phase 11: Polish

- [X] T035 [P] Test data generator `scripts/generate-people.mjs` (100 000 lines incl. today/tomorrow/3 days ago/29.02/invalid lines)
- [X] T036 Run `ng test` (coverage > 80% on domain), `ng build`, browser click-through per quickstart.md, measure import/search on 100k
- [X] T037 Write `specs/001-birthday-reminder/report.md` (every class/function: name, path, layer, purpose; coverage; test results) — Constitution IV

## Dependencies

- Phase 1 → Phase 2 → US1 → (US1a, US2, US3, US4 in any order) → US5, US6, US7 → Polish.
- US5 card needs US3 list for navigation, but is reachable by URL independently.

## Parallel Examples

- Phase 2: T005, T006, T007, T011, T012, T014, T015 in parallel (different files).
- P3 stories: T028, T029, T031, T033 in parallel.

## Implementation Strategy

MVP = Phase 1 + 2 + US1 (+ US1a). Then US2 → US3 → US4 → P3 stories, verifying each checkpoint.
