# Implementation Plan: Анимации интерфейса

**Branch**: `002-ui-animations` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-ui-animations/spec.md`

## Summary

Добавить осмысленное движение там, где оно несёт отклик, связность или радость: нажатие кнопок,
подтверждение о добавлении друга (с автоскрытием), удаление строки друга со сдвигом соседей,
появление итога импорта, мягкая смена экранов, каскад блоков главной, рост столбцов статистики
и конфетти один раз за сессию в день рождения друга. Всё делается на CSS (переходы,
`@starting-style`, одна keyframe-анимация конфетти) и встроенных в Angular `animate.enter` /
`animate.leave`, без новых зависимостей. Решения приняты скиллом `animate`, см.
[research.md](research.md) и [contracts/motion.md](contracts/motion.md).

## Technical Context

**Language/Version**: TypeScript (strict), Angular 22 (standalone, signals)

**Primary Dependencies**: только существующие (`@angular/core`, `@angular/router`, `@angular/cdk`). Новых нет.

**Storage**: N/A (признак «конфетти уже показаны» хранится в памяти модуля)

**Testing**: `ng test` (Vitest + coverage-v8), ручная проверка по [quickstart.md](quickstart.md)

**Target Platform**: современные браузеры с `@starting-style` (Chrome 117+, Safari 17.5+, Firefox 129+). В старых браузерах элементы просто появляются без анимации.

**Project Type**: фронтенд-SPA

**Performance Goals**: 60 fps. Анимируются только `opacity`/`transform` (исключение — короткое схлопывание строки, R4). Виртуальный список не затрагивается.

**Constraints**: отклик ≤ 300 мс, появление ≤ 500 мс, праздник ≤ 2 с (FR-007). Ввод не блокируется. Под reduced motion движения нет.

**Scale/Scope**: 8 мест движения (M1–M8) в 6 файлах presentation и в `src/styles.css`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Статус | Обоснование |
|---------|--------|-------------|
| I. Angular, только фронтенд | ✅ | Только CSS и шаблоны Angular, бэкенда нет |
| II. DDD | ✅ | Меняется только слой `presentation` и глобальные стили. `domain`/`application` не трогаются |
| III. Юнит-тесты чистых функций | ✅ | Новых чистых функций нет. Существующее покрытие > 80% не должно снизиться (проверка в quickstart, шаг 9) |
| IV. Отчёт по фиче | ✅ | `report.md` создаётся на этапе implement |
| V. Простота | ✅ | Без зависимостей: `@angular/animations`, Motion и библиотеки конфетти отклонены (R1, R8) |

**Post-design re-check**: ✅ нарушений нет, Complexity Tracking не требуется.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-animations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/motion.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── styles.css                                         # токены --ease-out/--ease-in-out, M1, M5
└── app/
    ├── birthdays/presentation/
    │   ├── home/home.page.ts                          # M2 (+ автоскрытие), M6, M8
    │   └── friends-carousel/friends-carousel.component.ts  # M1 для карточек
    ├── friends/presentation/friends.page.ts           # M3
    ├── people/presentation/file-import/import-summary.component.ts  # M4
    └── statistics/presentation/stats.page.ts          # M7
```

**Structure Decision**: существующая DDD-структура, правки только в `presentation` и `src/styles.css`.

## Complexity Tracking

Нарушений нет.
