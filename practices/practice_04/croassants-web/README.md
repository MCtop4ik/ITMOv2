# Four & Butter — Croissant Landing Page

Single-page marketing site for a bakery selling croissants. Built with Vite + React + TypeScript and Tailwind CSS. No backend.

## Features
- EN/RU localization with a simple language toggle in the header.
- Distinctive hero with a single steam animation (respects prefers-reduced-motion).
- Product gallery with filters (All/Sweet/Savory/Seasonal), accessible modal, and keyboard navigation.
- Visit section with address, hours, static map snapshot, and directions link.
- Unicode currency symbols for compact price display in EN (€, $, £); RUB for RU.

## Tech Stack
- Vite + React + TypeScript (Node 20.x)
- Tailwind CSS with a custom theme (colors, fonts, keyframes)
- npm as the package manager

## Getting Started
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
   - App runs at `http://localhost:5173`
3. Build for production:
   - `npm run build`
   - Output in `dist/`
4. Preview production build:
   - `npm run preview`

## Project Structure
- `index.html` — app entry
- `src/main.tsx` — React bootstrap
- `src/App.tsx` — layout and sections
- `src/components/` — UI components (Hero, ProductGallery, ProductModal, VisitSection, Footer)
- `src/data/products.ts` — static product catalog
- `src/styles/tailwind.css` — Tailwind and custom layer styles
- `public/images/` — hero, map, and product thumbnails

## Localization
- Header toggle switches `lang` between `en` and `ru`.
- Translated strings: header nav, hero, gallery filters, product names, descriptions (`descriptionRu`), tags, allergens, modal controls.

## Assets
- Images live under `public/images/`.
- See `public/images/README.txt` for source attribution.

## Accessibility
- Keyboard navigable modal (Esc/ArrowLeft/ArrowRight), visible focus rings, semantic landmarks, translated aria labels.
- Colors meet WCAG AA contrast for text.

## Design Notes
- Brand: Four & Butter. Fonts: Bricolage Grotesque, Spectral.
- Palette: flour, dough, crust, indigo, butter, copper, sage, charcoal.
- Global flour-speckled background; “linen” section surfaces.

## Development Notes
- Manual UI verification possible via Playwright MCP in OpenCode sessions.
- Future: optimize hero and thumbnails with webp/srcset.

## License
Proprietary — internal project.
