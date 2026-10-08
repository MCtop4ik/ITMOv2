Project Requirements (Current)

Stack
- Vite + React + TypeScript. Node.js 20.x.
- Styling: Tailwind CSS with a custom theme (colors, fonts, keyframes).
- Package manager: npm.

Brand & Design
- Brand: Four & Butter.
- Typography: Bricolage Grotesque (headings/UI) и Spectral (body).
- Palette (Tailwind custom colors): flour, dough, crust, indigo, butter, copper, sage, charcoal.
- Motion: одна ненавязчивая анимация пара в герое; учитываем prefers-reduced-motion.

Features
- Single-page маркетинговый сайт без бэкенда.
- Локализация EN/RU: переключатель в header; тексты геро-секции, навигации, фильтров галереи, названия, описания, теги, аллергенные списки адаптируются.
- Галерея продуктов вместо меню-листа: сетка карточек с фильтрами (Все/Сладкие/Сытные/Сезонные), доступная модалка с навигацией Prev/Next и закрытием Esc/overlay.
- Визит-секция: адрес, часы, кнопка "Маршрут", статичное изображение карты.
- Хедер: фиксированный, подсветка активного раздела через IntersectionObserver.

Data & Assets
- Каталог: `src/data/products.ts` (static array). Поля: id, name, nameRu, price, currency, description, descriptionRu, image, category, tags, allergens.
- Изображения: `public/images/` — hero-croissant.png, map-snapshot.jpg, превью PNG для каждого товара.
- `public/images/README.txt` — источники изображений.

Accessibility
- Видимый фокус у ссылок/кнопок; aria-атрибуты для модалки; семантические landmarks.
- Контраст соответствует WCAG AA для текста.

Performance
- Лёгкие CSS-анимации; без тяжёлых библиотек.
- Фолбэк для изображений при ошибке загрузки.
- Планируемая оптимизация: hero/webp + srcset.

UI Details
- Герой: полноэкранный фон hero-croissant.png, градиентный оверлей, заголовок, две кнопки ("Мы здесь" / "Our croissants").
- Галерея: карточки с изображением, названием, ценой, кратким описанием; цены:
  - EN: используется юникод-символ валюты (€, $, £) вместо текстового кода.
  - RU: рубли отображаются как `₽` с локальной конверсией из EUR (упрощённо: `price * 100`).
- Модалка: крупное изображение, полное описание, цена, теги (переводятся на RU), аллергенный список (переводится на RU), кнопки "Назад/Далее".

Dev Workflow
- Старт: `npm run dev` (Vite порт 5173).
- Билд: `npm run build` → `dist/`.
- Превью продакшн-сборки: `npm run preview`.
- Вручную проверяем через Playwright MCP (в OpenCode).

Acceptance Criteria
- Страница работает на десктопе и мобильном; герой заполняет экран с читаемым контентом.
- Одна не пользовательская анимация, отключается при prefers-reduced-motion.
- Галерея с фильтрами и модалкой; отдельного меню нет.
- Визит-секция показывает адрес/часы/картинку; ссылка ведёт на карты.
- Локализация RU переводит все пользовательские тексты, теги и аллергенные списки.
- Изображения не битые; источники задокументированы.

Risks / Follow-ups
- Некоторые превью из Unsplash могут редиректить; предусмотрен фолбэк.
- Оптимизация hero-изображения (webp/srcset) — будущая задача.
- Статическая карта может быть заменена на брендированную.
