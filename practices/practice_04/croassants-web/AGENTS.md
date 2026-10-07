Project Intent
- Single-page marketing site for a bakery selling croissants, built in React. Generate the croissant catalog/content in-code; no backend unless explicitly requested.

Repo Snapshot
- No JavaScript/TypeScript project yet (no package.json, lockfiles, build or test scripts). You must scaffold the React app before any dev commands exist.
- Existing files: README.md (generic GitLab template), opencode.json (OpenCode provider config), AGENTS.md (this guidance).
- Playwright MCP is enabled via opencode.json. You can use the Playwright tools in OpenCode sessions to preview and interact with the dev server.

Scaffolding (Default)
- Create a Vite + React + TypeScript app at the repository root. This keeps the landing page fast and produces a static build.
- Package manager: use npm by default unless the user specifies pnpm or yarn.
- Commands to initialize:
  - npm: `npm create vite@latest . -- --template react-ts`
  - then: `npm install`

Dev Workflow (after scaffold)
- Start dev server: `npm run dev` (Vite default port is 5173). Use Playwright MCP to open and test the page.
- Build for production: `npm run build` (outputs to `dist/`).
- Preview production build: `npm run preview`.

Structure Guidance
- Keep code at the root Vite layout: `index.html`, `src/main.tsx`, `src/App.tsx`.
- Put catalog data in `src/data/products.ts` (static array of croissant variants, prices, descriptions, images). Keep images under `public/`.
- Keep small, composable components under `src/components/`.

Testing
- No tests exist. If you add tests, prefer Vitest for unit tests and use Playwright MCP for manual UI verification during development.

Operational Notes
- Do not modify `opencode.json` unless you are explicitly configuring OpenCode (providers, MCP). For OpenCode configuration changes, use the customize-opencode skill.
- There is no CI/formatter/linter configured. If you add them, document exact commands here.

Open Questions to Resolve (ask once, then record the decisions here)
- Package manager preference: npm, pnpm, or yarn.
- Styling approach: CSS Modules, Tailwind, styled-components, or plain CSS.
- Language: TypeScript or JavaScript.
- Target Node.js version (default to current LTS).
