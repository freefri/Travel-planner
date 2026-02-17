# Travel Planner

This is a standalone, client-only microfrontend for trip planning. It is developed independently and can be integrated into the main application host using **Module Federation** or as a native ESM module.

## Tech Stack

- **React 19**: Modern UI library for the web.
- **Tailwind CSS 4**: Utility-first CSS framework.
- **Rspack**: High-performance Rust-based bundler.
- **Module Federation**: Webpack Module Federation for dynamic component sharing.
- **TypeScript**: Static typing for Javascript (Never use `any` as type).

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- **Node.js**: v22.16.0 (see `.nvmrc`). Install via [nvm](https://github.com/nvm-sh/nvm).

### 2. Installation

Install all dependencies using the setup script:

```bash
npm run setup
```

### 3. Development

Run the development server with Hot Module Replacement (HMR):

```bash
nvm use
npm run dev
```

The application will be available at `http://localhost:3010`.

### 4. Build & Production

To create a production-ready bundle with Module Federation:

```bash
npm run build
```

The output will be in the `dist/` directory.

You can also serve the production build locally:

```bash
npm run serve
```

### 5. Running Tests

To run the tests in headless mode:

```bash
npm run test:e2e
```

To run tests in UI mode (interactive):

```bash
npx playwright test --ui
```

To update visual snapshots:

```bash
npx playwright test --update-snapshots
```

The test suite covers:

- Page title and header validation.
- Initial sample data rendering.
- Detailed place view functionality.
- Search and filtering logic.
- **Visual Regression**: Uses `toHaveScreenshot()` to ensure UI consistency.

#### Git Configuration for Tests

It is correct to ignore the following directories in `.gitignore`:

- `/playwright-report/`: Contains the generated HTML reports after a run.
- `/test-results/`: Contains traces, logs, and failure screenshots from specific runs.

**Important**: The `*.png` files generated for snapshot testing (found in `tests/*.spec.ts-snapshots/`) **should be committed** to Git. These serve as the "ground truth" or baseline for future tests. If you change the design intentionally, you must run the update command above to generate new baseline images.

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run setup` | Installs project dependencies. |
| `npm run dev` | Starts the Rspack dev server and Tailwind watcher. |
| `npm run build` | Builds the project for production with Module Federation. |
| `npm run build:client` | Builds the client bundle using production config. |
| `npm run build:tailwind` | Compiles Tailwind CSS. |
| `npm run serve` | Serves the production build locally. |
| `npm run type-check` | Runs TypeScript type checking. |
| `npm run test:e2e` | Runs Playwright end-to-end tests. |
| `npm run test:e2e:report` | Serves the last Playwright HTML report. |
| `npm run lint` | Runs ESLint for code quality. |
| `npm run clean` | Removes build artifacts and `node_modules`. |

*Always keep this list updated*

## Integration Architecture

This microfrontend supports two integration modes:

### 1. Module Federation (Recommended)

The microfrontend uses **Webpack Module Federation** via `@module-federation/enhanced` to expose components dynamically.

**Configuration:**

- **Module Name**: `mf_tutor`
- **Remote Entry**: `dist/remoteEntry.js`
- **Port**: `3010`

**Exposed Components:**

- `./Renderer` → Exports the main component

**Shared Dependencies:**

- `typescript` (singleton)

**External Dependencies:**
React and React DOM are externalized as `window` globals and should be provided by the host application.

### 2. Native ESM Module (Legacy)

For development or standalone usage, the microfrontend can also be built as a native ESM module using `rspack.config.cjs`.

- **Entry Point**: `dist/chat.js`
- **Styles**: `public/tailwind.css`
- **Library Type**: ESM Module

**Note:** All React-related libraries (react, react-dom, etc.) are externalized to ensure they are shared from the host environment.

## UI Design Guidelines

The design with Tailwind CSS 4.

- **Design Tokens**: Available in `src/styles/global.css`
- **Component Library**: Shadcn-based components in `src/components/ui/`
- **Styling**: Use Tailwind utility classes for consistency
- **Theme**: Supports light/dark mode via CSS variables
- **`public/tailwind.css`** is auto-generated — never edit it directly; edit `src/styles/global.css` instead
- **Path alias**: `@` resolves to `src/`

### Component Naming Convention

To ensure easier debugging within a microfrontend environment and maintain reliable end-to-end (E2E) testing, all components must follow these conventions:

#### Root Element Class (`mf-`)

- The **root element** of every component must have a class name starting with `mf-` followed by the kebab-case name of the component.
- Example: `mf-travel-header`, `mf-edit-place-modal`, `mf-travel-card`.
- Purpose: This ensures consistent styling and easier debugging in a microfrontend environment.

#### E2E Test Class (`e2e-`)

- For E2E testing, any element that will be interacted with (clicked, typed into, etc.) must have a **dedicated class starting with `e2e-`** followed by a descriptive name.
- Example: `e2e-submit-button`, `e2e-place-input`, `e2e-travel-card-delete`.
- **Do not use Tailwind classes for E2E selectors**, as these can change during builds and break tests.
- Purpose: Ensures stable and maintainable E2E tests that are decoupled from styling.

### Development Philosophy & Refactoring

To maintain a clean and sustainable codebase, all developers (and AI agents) must adhere to the following principles:

- **Logic Extraction**: If a component's logic grows too large or complex (e.g., complex data grouping, heavy rendering calculations, or large conditional blocks), it **must** be extracted into its own dedicated component.
  - *Example: `TravelGrid` was extracted from `Travel.tsx` to handle day-based grouping logic.*
- **Single Responsibility**: Each component should ideally do one thing. If you find yourself adding descriptive comments for "blocks" of rendering logic within a component, that's a strong signal to refactor.
- **Proactive Refactoring**: Do not wait for a specific "refactoring task." Every feature update or change is an opportunity to improve the structure and readability of the surrounding code.
- **Logic Isolation**: Keep data processing logic (like `useMemo` hooks for sorting/filtering) or external API templates (like image placeholder URLs) distinct from the JSX structure.
  - *Example: `getPlaceholderImage` utility was extracted to `src/lib/place-utils.ts` to keep `TravelCard` and `EditPlaceModal` clean.*

## Project Structure

```
mf_tutor/
├── src/
│   ├── Travel.tsx              # Main component
│   ├── Renderer.tsx          # Module Federation export
│   ├── bootstrap.tsx         # Application bootstrap
│   ├── components/
│   │   └── ui/              # Shadcn UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── styles/              # Global styles and Tailwind config
├── public/
│   ├── index.html           # Development HTML template
│   └── tailwind.css         # Compiled Tailwind CSS
├── rspack.config.cjs        # Development config (ESM mode)
├── rspack_prod.config.cjs   # Production config (Module Federation)
└── package.json
```
