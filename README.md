# MF Tutor Microfrontend

This is a standalone, client-only microfrontend for the Chat/Tutor feature. It is developed independently and can be integrated into the main application host using **Module Federation** or as a native ESM module.

## Tech Stack

- **React 19**: Modern UI library for the web.
- **Tailwind CSS 4**: Utility-first CSS framework.
- **Rspack**: High-performance Rust-based bundler.
- **Module Federation**: Webpack Module Federation for dynamic component sharing.
- **TypeScript**: Static typing for Javascript.
- **Shadcn Chatbot Kit**: UI components for chat interface.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- **Node.js**: We recommend using the version specified in `.nvmrc` (v22.16.0).
- **nvm**: If you have [nvm](https://github.com/nvm-sh/nvm) installed, just run:
  ```bash
  nvm use
  ```

### 2. Installation

Install all dependencies using the setup script:
```bash
npm run setup
```

### 3. Development

Run the development server with Hot Module Replacement (HMR):
```bash
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
| `npm run lint` | Runs ESLint for code quality. |
| `npm run clean` | Removes build artifacts and `node_modules`. |

## Integration Architecture

This microfrontend supports two integration modes:

### 1. Module Federation (Recommended)

The microfrontend uses **Webpack Module Federation** via `@module-federation/enhanced` to expose components dynamically.

**Configuration:**
- **Module Name**: `mf_tutor`
- **Remote Entry**: `dist/remoteEntry.js`
- **Port**: `3010`

**Exposed Components:**
- `./Renderer` → Exports the `Chat` component

**Shared Dependencies:**
- `typescript` (singleton)

**External Dependencies:**
React and React DOM are externalized as `window` globals and should be provided by the host application.

**Host Integration Example:**
```javascript
// In your host application's Module Federation config
remotes: {
  mf_tutor: 'mf_tutor@http://localhost:3010/remoteEntry.js'
}

// Usage in host app
import { Chat } from 'mf_tutor/Renderer';

function App() {
  return <Chat />;
}
```

### 2. Native ESM Module (Legacy)

For development or standalone usage, the microfrontend can also be built as a native ESM module using `rspack.config.cjs`.

- **Entry Point**: `dist/chat.js`
- **Styles**: `public/tailwind.css`
- **Library Type**: ESM Module

**Note:** All React-related libraries (react, react-dom, etc.) are externalized to ensure they are shared from the host environment.

## UI Design Guidelines

The design follows the **Shadcn Chatbot Kit** design system with Tailwind CSS 4.

- **Design Tokens**: Available in `src/styles/global.css`
- **Component Library**: Shadcn-based components in `src/components/ui/`
- **Styling**: Use Tailwind utility classes for consistency
- **Theme**: Supports light/dark mode via CSS variables

## Project Structure

```
mf_tutor/
├── src/
│   ├── Chat.tsx              # Main chat component
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
