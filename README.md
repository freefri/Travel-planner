# MF Chat Microfrontend

This is a standalone, client-only microfrontend for the Chat feature. It is developed independently and integrated into the main application host using native ESM modules.

## Tech Stack

- **React 19**: Modern UI library for the web.
- **Tailwind CSS 4**: Utility-first CSS framework.
- **Rspack**: High-performance Rust-based bundler.
- **TypeScript**: Static typing for Javascript.

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

To create a production-ready bundle:
```bash
npm run build
```
The output will be in the `dist/` directory.

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run setup` | Installs project dependencies. |
| `npm run dev` | Starts the Rspack dev server and Tailwind watcher. |
| `npm run build` | Builds the project for production. |
| `npm run type-check` | Runs TypeScript type checking. |
| `npm run lint` | Runs ESLint for code quality. |
| `npm run clean` | Removes build artifacts and `node_modules`. |

## Integration Architecture

This microfrontend is built as a **Native ESM Module**. 
The host application loads this module dynamically. 

- **Entry Point**: `dist/chat.js`
- **Styles**: `dist/client/styles/tailwind.css`

Note: All React-related libraries (react, react-dom, etc.) are externalized to ensure they are shared from the host environment.

## UI Design Guidelines

Please follow the existing design system tokens available in `src/styles/global.css`. 
Use Tailwind classes for styling to ensure consistency with the rest of the application.
