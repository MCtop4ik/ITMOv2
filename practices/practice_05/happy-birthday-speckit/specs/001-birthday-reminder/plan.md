# Implementation Plan: Напоминалка о днях рождения

**Branch**: `001-birthday-reminder` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-birthday-reminder/spec.md`

## Summary

Одностраничное Angular-приложение без бэкенда: пользователь загружает текстовый файл (до 100 000
записей «ФИО (ДД.ММ.ГГГГ)|»), выбирает друзей (в том числе из карусели случайных людей), и
главный экран показывает дни рождения друзей сегодня, ближайшие и недавно прошедшие. Дополнительно —
поиск по всем людям, карточка с готовым поздравлением, календарь по месяцам и статистика по файлу.
Техподход: DDD с чистым доменом на TypeScript (даты как value object без `Date`, «сегодня»
параметром), исходный файл в IndexedDB и разбор при запуске, друзья в localStorage, signals для
состояния, CDK virtual scroll для длинных списков (см. [research.md](research.md)).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Angular 22

**Primary Dependencies**: Angular (core, router, forms), `@angular/cdk` (только virtual scroll)

**Storage**: IndexedDB (исходный текст файла), localStorage (друзья, настройки) — см.
[contracts/storage.md](contracts/storage.md)

**Testing**: `ng test` (`@angular/build:unit-test` + Vitest), покрытие `@vitest/coverage-v8`

**Target Platform**: современные браузеры (последние версии Chrome, Firefox, Safari, Edge)

**Project Type**: frontend-only single-page web application

**Performance Goals**: импорт 100 000 строк ≤ 5 с; главная при повторном открытии ≤ 2 с; поиск
< 0,3 с на символ; статистика ≤ 2 с; плавная прокрутка списка 100 000 записей

**Constraints**: без сервера и сетевых запросов с данными; работа офлайн после загрузки страницы;
весь UI на русском; `prefers-reduced-motion` учитывается в карусели

**Scale/Scope**: до 100 000 людей, неограниченное число друзей, 6 экранов, 8 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Проверка | Статус |
|---|---|---|
| I. Angular, только фронтенд | Angular 22, standalone; нет бэкенда/API/БД на сервере; данные из файла пользователя | ✅ |
| II. DDD | Контексты `people`, `birthdays`, `friends`, `statistics` + `shared` kernel; слои `domain/application/infrastructure/presentation`; домен без импортов Angular/RxJS/браузерных API; ubiquitous language: Person, CalendarDate, UpcomingBirthday, FriendList, FileStatistics | ✅ |
| III. Юнит-тесты чистых функций > 80% | Вся логика (парсинг, даты, поиск, юбилеи, зодиак, поздравление, статистика, выборка) — чистые функции в `domain` с `today`/`rng` параметрами; порог покрытия 81% для `**/domain/**` в `angular.json` | ✅ |
| IV. Отчёт по фиче | Финальная задача — `specs/001-birthday-reminder/report.md` со всеми классами/функциями, слоем и покрытием | ✅ (запланировано) |
| V. Простота | Одна новая зависимость (`@angular/cdk`) с обоснованием (R5); без Worker, без библиотек дат/IndexedDB | ✅ |

**Post-design re-check (после Phase 1)**: data-model и contracts не добавили нарушений; доменные
функции не требуют Angular; порты хранилищ определены в application, реализации в infrastructure. ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-birthday-reminder/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── input-file-format.md
│   ├── storage.md
│   └── ui-routes.md
├── checklists/requirements.md
├── tasks.md             # /speckit-tasks
└── report.md            # после реализации (Constitution IV)
```

### Source Code (repository root)

```text
src/
├── main.ts
├── styles.css
└── app/
    ├── app.config.ts            # провайдеры, LOCALE_ID 'ru', роутер
    ├── app.routes.ts
    ├── app.ts                   # оболочка: вкладки, «Загрузить файл», drag&drop
    ├── shared/
    │   ├── domain/              # calendar-date.ts, russian-format.ts, random.ts (+ *.spec.ts)
    │   └── application/         # clock.service.ts (signal «сегодня», обновление в полночь)
    ├── people/
    │   ├── domain/              # person.ts, parse-people-file.ts, search-people.ts (+ specs)
    │   ├── application/         # people.store.ts (signals: people, importResult), people-file-store.port.ts
    │   ├── infrastructure/      # indexed-db-people-file-store.ts, decode-file.ts
    │   └── presentation/        # file-import/, people-list/, person-card/
    ├── birthdays/
    │   ├── domain/              # birthday.ts, zodiac.ts, greeting.ts, month-calendar.ts (+ specs)
    │   ├── application/         # birthdays.facade.ts (computed от friends + today)
    │   └── presentation/        # home/, friends-carousel/, calendar/
    ├── friends/
    │   ├── domain/              # friend-list.ts (+ spec)
    │   ├── application/         # friends.store.ts, friend-store.port.ts
    │   ├── infrastructure/      # local-storage-friend-store.ts
    │   └── presentation/        # friends-page/
    └── statistics/
        ├── domain/              # compute-statistics.ts (+ spec)
        └── presentation/        # stats-page/
scripts/
└── generate-people.mjs          # генератор тестового файла на 100 000 строк
```

Тесты лежат рядом с кодом (`*.spec.ts`) — конвенция Angular CLI.

**Structure Decision**: один Angular-проект в корне репозитория, разбитый по ограниченным
контекстам, внутри каждого — DDD-слои. Зависимости направлены внутрь: presentation → application →
domain; infrastructure реализует порты application. Межконтекстные зависимости — только через
`domain`-типы (`birthdays` и `statistics` читают `Person`/`Friend`, `shared` не зависит ни от кого).

## Complexity Tracking

Нарушений Constitution Check нет.
