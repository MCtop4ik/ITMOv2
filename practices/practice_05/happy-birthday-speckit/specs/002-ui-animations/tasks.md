---

description: "Task list for 002-ui-animations"
---

# Tasks: Анимации интерфейса

**Input**: Design documents from `/specs/002-ui-animations/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/motion.md, quickstart.md

**Tests**: Спецификация тесты не требует, новых чистых функций нет (принцип III). Тесты добавлены
только на два места с настоящей логикой: таймер автоскрытия `justAdded` (data-model.md) и признак
`celebrated` «один раз за сессию». Всё остальное: CSS, проверяется по quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Motion rules for every task** (из contracts/motion.md и скилла `animate`): только `opacity`/`transform`
(исключение: `grid-template-rows` в M3); кривая `var(--ease-out)`; никаких `ease-in`, `transition: all`,
`scale(0)` для появления (M7 `scaleX(0)` это рост значения, не появление); переходы вместо keyframes
для всего, что можно вызвать повторно; наведение остаётся мгновенной сменой цвета, без движения.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: зафиксировать исходное состояние, с которым сравнивается результат

- [X] T001 Запустить `npm run build` и `npm test` в корне репозитория, записать процент покрытия (строки/ветви) в черновик `specs/002-ui-animations/report.md` как базовую линию для шага 9 quickstart

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: общие токены движения, на которые ссылаются все M1–M8

- [X] T002 Добавить в `:root` в `src/styles.css` токены `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` и `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);` (R2). Длительности не выносить в токены, они указываются по месту. Глобальное правило `@media (prefers-reduced-motion: reduce)` в конце файла не трогать (R9)

**Checkpoint**: токены есть, сборка проходит

---

## Phase 3: User Story 1 - Видеть отклик на свои действия (Priority: P1) 🎯 MVP

**Goal**: нажатие, добавление в друзья, удаление друга и итог импорта видны как короткое движение (M1–M4)

**Independent Test**: добавить человека из карусели (подтверждение появляется и через ~4 с само уходит), удалить друга на «Мои друзья» (строка схлопывается, соседи поднимаются): quickstart шаги 1–4

### Tests for User Story 1

- [X] T003 [US1] Написать падающий тест `src/app/birthdays/presentation/home/home.page.spec.ts` (Vitest fake timers, TestBed с реальными провайдерами приложения или заглушками `FRIEND_STORE`/`PEOPLE_FILE_STORE`): после добавления из карусели подтверждение с именем видно; через 4000 мс исчезает; повторное добавление через 3000 мс показывает новое имя и сбрасывает таймер (через 3999 мс после него ещё видно); кнопка «Скрыть» убирает сразу; после `fixture.destroy()` таймер не срабатывает. Проверять DOM (`.added`), а не поля компонента. Убедиться, что тест падает именно из-за отсутствия автоскрытия

### Implementation for User Story 1

- [X] T004 [US1] Реализовать автоскрытие в `src/app/birthdays/presentation/home/home.page.ts`: при `justAdded.set(name)` в `addFromCarousel` перезапускать один `setTimeout` на 4000 мс, который ставит `null`; очищать таймер в `DestroyRef.onDestroy`. Правила из data-model.md: «После установки имени сбрасывается в `null` через 4 с. Повторная установка перезапускает таймер. Кнопка «Скрыть» сбрасывает сразу. Таймер очищается при уничтожении компонента.» T003 должен пройти
- [X] T005 [P] [US1] M1 в `src/styles.css`: в `.btn` добавить `transition: transform 160ms var(--ease-out)`, правило `.btn:active { transform: scale(0.97); }`. Существующую мгновенную смену цвета на `:hover` не анимировать (R3)
- [X] T006 [P] [US1] M1 в `src/app/birthdays/presentation/friends-carousel/friends-carousel.component.ts`: для `button.person` то же нажатие `transform: scale(0.97)`, `transition: transform 160ms var(--ease-out)`. Бегущую ленту `.track` (`animation: slide 80s linear infinite`) не менять
- [X] T007 [US1] M2 в `src/app/birthdays/presentation/home/home.page.ts` (после T004): у `p.added` появление через `transition: opacity 250ms var(--ease-out), transform 250ms var(--ease-out)` и `@starting-style { opacity: 0; transform: translateY(-8px); }`; уход тем же путём через `animate.leave="added-leave"` с классом `.added-leave { opacity: 0; transform: translateY(-8px); }`. Повторное добавление меняет только текст, элемент не пересоздаётся
- [X] T008 [P] [US1] M3 в `src/app/friends/presentation/friends.page.ts`: обернуть содержимое `<li>` во внутренний `<div class="row">` с `overflow: hidden; min-height: 0`, перенести на него текущую раскладку строки; `<li>` сделать `display: grid; grid-template-rows: 1fr; transition: grid-template-rows 200ms var(--ease-out), opacity 200ms var(--ease-out)`; добавить `animate.leave="row-leave"` и `.row-leave { grid-template-rows: 0fr; opacity: 0; }` (R4). Проверить, что рамки/отступы строки не остаются видимой полосой после схлопывания
- [X] T009 [P] [US1] M4 в `src/app/people/presentation/file-import/import-summary.component.ts`: корневому элементу внутри `@if (people.lastImport(); as result)` задать `transition: opacity 250ms var(--ease-out), transform 250ms var(--ease-out)` и `@starting-style { opacity: 0; transform: translateY(8px); }`
- [X] T010 [US1] Проверить риск R9 (после T007, T008): в DevTools включить `prefers-reduced-motion: reduce`, скрыть подтверждение и удалить друга: элементы должны исчезать сразу. Если `animate.leave` оставляет элемент в DOM, добавить в `src/styles.css` внутри существующего `@media (prefers-reduced-motion: reduce)` правило, которое делает классы `.added-leave` и `.row-leave` мгновенными, и записать решение в `specs/002-ui-animations/research.md` (R9)

**Checkpoint**: quickstart шаги 1–4 и 7 (для M1–M4) проходят; `npm test` зелёный

---

## Phase 4: User Story 2 - Плавное появление экранов и списков (Priority: P2)

**Goal**: мягкая смена экранов, каскад блоков главной, рост столбцов статистики (M5–M7); длинные списки без анимации (FR-010)

**Independent Test**: пройти по всем пунктам меню, кликать сразу после перехода; на статистике столбцы растут слева: quickstart шаги 5 и 8

### Implementation for User Story 2

- [ ] T011 [P] [US2] M5 в `src/styles.css`: правило `main.page > router-outlet + * { display: block; transition: opacity 150ms var(--ease-out); }` и `@starting-style { opacity: 0; }` (R6). Только прозрачность, без сдвига; `<main id="main" class="page">` в `src/app/app.ts` не менять
- [ ] T012 [US2] M6 в `src/app/birthdays/presentation/home/home.page.ts`: блокам `section.today`, `.columns > section` (и пустому состоянию «Сегодня дней рождения нет») задать `transition: opacity 250ms var(--ease-out), transform 250ms var(--ease-out)`, `@starting-style { opacity: 0; transform: translateY(8px); }` и задержку с шагом 50 мс по порядку чтения (`transition-delay: calc(var(--i) * 50ms)`, `--i` проставить в шаблоне). Итог ≤ 500 мс (FR-007). Карточки внутри блоков построчно не анимировать
- [ ] T013 [P] [US2] M7 в `src/app/statistics/presentation/stats.page.ts`: для обоих списков `ul.bars` добавить на `span.bar` `[style.--i]="$index"`; в стилях `.bar { transform-origin: left; transition: transform 300ms var(--ease-out); transition-delay: calc(var(--i) * 15ms); }` и `@starting-style { transform: scaleX(0); }` (R7). Ширину оставить в `[style.width.%]`. 12 месяцев: 300 + 11 × 15 = 465 мс ≤ 500 мс
- [ ] T014 [US2] Проверить FR-010: правило M5 из T011 действует только на хост страницы, а строки виртуального списка в `src/app/people/presentation/people-list/` не получают `transition`/`animation` (DevTools → Computed на строке); прокрутка и поиск по 100 000 людей так же плавны, как до фичи (quickstart шаг 8)

**Checkpoint**: quickstart шаги 5 и 8 проходят, ссылки кликабельны сразу после перехода (SC-003)

---

## Phase 5: User Story 3 - Праздничный момент в день рождения друга (Priority: P3)

**Goal**: конфетти на главной один раз за сессию, если у друга сегодня день рождения (M8)

**Independent Test**: добавить друга с сегодняшним днём рождения, открыть главную: конфетти ≤ 2 с; уйти и вернуться: конфетти нет; перезагрузить: снова есть (quickstart шаг 6)

### Tests for User Story 3

- [ ] T015 [US3] Написать падающий тест `src/app/birthdays/presentation/home/home.page.celebrate.spec.ts` (отдельный файл, потому что признак `celebrated` живёт в переменной модуля и Vitest изолирует модули по файлам; время передаётся через подмену `ClockService`). Тесты в фиксированном порядке внутри одного `describe`: (1) без сегодняшних дней рождения у друзей элемента `.confetti` нет; (2) с другом, у которого день рождения сегодня, `.confetti` есть; (3) второй экземпляр `HomePage` в том же файле `.confetti` не показывает. Проверять DOM

### Implementation for User Story 3

- [ ] T016 [US3] В `src/app/birthdays/presentation/home/home.page.ts` (после T012): переменная модуля `let celebrated = false;`; при создании компонента вычислить `showConfetti = !celebrated && facade.today().length > 0`, при `true` поставить `celebrated = true` (data-model.md: «Конфетти показываются, только если `!celebrated && facade.today().length > 0`»). В шаблоне при `showConfetti` вывести контейнер `<div class="confetti" aria-hidden="true">` с 16 `<span [style.--i]="$index">` внутри `section.today`. T015 должен пройти
- [ ] T017 [US3] Стили M8 в `src/app/birthdays/presentation/home/home.page.ts`: `.confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }` (у `section.today` `position: relative`); одна общая `@keyframes` падения с вращением через `transform` и затухания через `opacity`, 1600 мс `var(--ease-out)`, `animation-fill-mode: forwards`; позиция, задержка (≤ 375 мс, итог ≤ 2 с, FR-006) и цвет детерминированно из `--i`. Цвета брать только из существующих токенов `src/styles.css` (`--link`, `--success`, `--warning`, `--error`, `--white`), новые не заводить (R-29). Добавить `@media (prefers-reduced-motion: reduce) { .confetti { display: none; } }`: глобальное правило отключает анимацию, и без этого цветные квадраты остались бы на месте поверх текста

**Checkpoint**: quickstart шаги 6 и 7 (для M8) проходят; `npm test` зелёный

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 Пройти весь `specs/002-ui-animations/quickstart.md` в браузере (`npm start`) на десктопе и на ширине 375 px, в обычном режиме и с `prefers-reduced-motion: reduce`; в DevTools → Animations сверить длительности с `contracts/motion.md` (SC-002); консоль без ошибок. Записать проход по каждому шагу как свидетельство (R-35)
- [ ] T019 Запустить `npm run build` и `npm test`; покрытие чистых функций не ниже базовой линии из T001 (принцип III)
- [ ] T020 Дописать `specs/002-ui-animations/report.md` по принципу IV: каждый изменённый класс/функцию и CSS-правило (имя, путь, слой DDD, что делает), фактическое покрытие, результат тестов, итог T018

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)** → **Foundational (T002)** → все истории
- **US1, US2, US3** не зависят друг от друга по поведению, но три задачи правят один файл `home.page.ts`: T004 → T007 (US1) → T012 (US2) → T016 → T017 (US3). При параллельной работе этот файл ведёт один исполнитель
- **Polish (T018–T020)** после всех нужных историй

### Within Each User Story

- US1: T003 → T004 → T007 → T010; T005, T006, T008, T009 параллельно после T002; T010 после T007 и T008
- US2: T011, T013 параллельно; T012 после T007; T014 после T011
- US3: T015 → T016 → T017

### Parallel Opportunities

- После T002: T005, T006, T008, T009, T011, T013: все в разных файлах
- T003 (тест) можно писать параллельно с CSS-задачами

## Parallel Example: User Story 1

```text
T005 M1 .btn в src/styles.css
T006 M1 карусель в friends-carousel.component.ts
T008 M3 строка друга в friends.page.ts
T009 M4 итог импорта в import-summary.component.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001–T002
2. T003–T010
3. **STOP and VALIDATE**: quickstart шаги 1–4 и 7

### Incremental Delivery

1. US1 → отклик на действия (MVP)
2. US2 → смена экранов, каскад, столбцы
3. US3 → конфетти
4. Polish → quickstart целиком, gates, report.md
