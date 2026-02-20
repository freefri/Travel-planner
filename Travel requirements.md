# Travel Planner Microfrontend Requirements

This document outlines the requirements and specifications for the Travel Planner microfrontend (`mf_tutor` / `mf_travel`). This is a specialized tool for managing travel itineraries via KMZ/KML files, compatible with Organic Maps.

## 1. Overview

The application is a React-based microfrontend designed to import, edit, and export travel plans stored in KMZ/KML format. It focuses on a clean, day-by-day visualization of travel points, automatic data enrichment (images/descriptions), and maintaining compatibility with the Organic Maps (OMaps) extended KML format.

## 2. Project Structure

```text
src/
├── components/          # UI Components (TravelGrid, TravelHeader, modals, selectors)
│   └── ui/              # Base UI components (buttons, cards, inputs)
├── hooks/               # Custom hooks (auto-scroll, clipboard, etc.)
├── lib/                 # Core logic (KMZ parser, formatting utils, API fetchers)
├── styles/              # Global CSS and themes
├── types/               # TypeScript interfaces
├── Travel.tsx           # Main application logic
└── Renderer.tsx        # Module Federation entry point
```

## 3. Tech Stack

- **Framework**: React 19+
- **Build Tool**: Rspack (with Module Federation)
- **Styling**: Tailwind CSS 4+
- **State Management**: React Hooks (useState, useMemo, useEffect)
- **Utilities**:
  - `jszip` for KMZ (zip) handling.
  - `lucide-react` for iconography.
  - `framer-motion` for animations.
  - `remeda` for data manipulation.
- **Testing**:
  - `Vitest` for unit/logic tests.
  - `Playwright` for E2E and visual comparison tests.

## 3. Data Architecture

### Core Types (`src/types/travel.ts`)

- **Place**: The primary data unit.
  - `id`: Unique identifier.
  - `name`: Formatted title (see Name Standardization).
  - `description`: Plain text or HTML description.
  - `timestamp`: ISO string (from `<when>` tag).
  - `styleUrl`: Reference to the KML style (color-coded).
  - `ddgImage`: URL of an image retrieved from DuckDuckGo.
  - `coordinates`: `{ lat, lng, alt? }`.
  - `extendedData`: Organic Maps specific metadata.
- **ExtendedData**:
  - `featureTypes`: Array of strings (e.g., `tourism-attraction`).
  - `icon`: Semantic icon name (e.g., `Sights`, `Hotel`).
  - `visibility`: Boolean.
  - `name`/`description`: Multi-language support (MWMLang).

## 4. Core Features

### 4.1 KMZ/KML Engine (`src/lib/kmz-parser.ts`)

- **Import**:
  - Support both `.kmz` (zipped archives containing `doc.kml`) and plain `.kml` files.
  - Parse `<Placemark>` elements into `Place` objects.
  - Extract `<TimeStamp><when>` for scheduling.
  - **DDG Image Extraction**: If a description contains an `<img>` tag with a DuckDuckGo URL, extract it into the `ddgImage` field and remove the tag from the visual description.
  - Handle OMaps namespace (`mwm:`) for extended data (icons, feature types, multi-lang names).
- **Export**:
  - Generate valid KML 2.2 with `mwm` namespace declarations.
  - Re-embed `ddgImage` into the `<description>` as an HTML `<img>` tag for compatibility with standard KML viewers.
  - Preserve all OMaps extended data.

### 4.2 Data Enrichment

- **DuckDuckGo Integration**: Automatically fetch descriptions (Abstract) and images from the DuckDuckGo API based on the place name if they are missing.
- **Smart Fetching**: Sequentially fetch data to avoid API rate limiting and prevent redundant queries for already enriched places.

### 4.3 Name Standardization (`src/lib/place-utils.ts`)

- **Format**: `DDDD. HH:MM <emoji> <title>`
  - `DDDD`: Day number relative to the trip start.
  - `HH:MM`: Time of the visit.
  - `<emoji>`: Mapped from the OMaps `icon` field.
  - `<title>`: The pure name of the location.
- **Live Sync**: Any change to the timestamp, icon, or trip start date should automatically trigger a rename to maintain the format.

## 5. User Interface

### 5.1 Dashboard (`src/components/TravelGrid.tsx`)

- **Day Grouping**: Places must be grouped and headers displayed for "Day 1", "Day 2", etc.
- **Empty States**: Clear messaging when no places match filters or no files are imported.

### 5.2 Place Cards

- **Visuals**: Show place name, formatted time, category icon, and the enriched image.
- **Interactions**: Highlight on hover, selected state, and click-to-edit.

### 5.3 Filtering & Search

- **Search**: Case-insensitive search across names and feature types.
- **Date Filter**: Dropdown to show only places from a specific calendar day.
- **Icon Filter**: Filter by OMaps category (e.g., only "Sights").
- **Visual Feedback**: Real-time filtering with Smooth transitions.

### 5.4 Edit Place Modal (`src/components/EditPlaceModal.tsx`)

- **Layout**: 2-column view for desktop.
- **Fields**:
  - Name (editing only the "pure" title part).
  - Date & Time (separate pickers).
  - Coordinates (Lat/Lng).
  - Icon Selector (mapped to OMaps icons and emojis).
  - Feature Types (multi-select/tag selector).
  - Description (multi-line).
  - Image Preview (showing DDG image or placeholder).

## 6. Design & Aesthetics

- **Theme**: "Bluewave Light" (CSS variable-based system).
- **Glassmorphism**: Subtle use in headers and modals.
- **Micro-animations**: Smooth transitions for filtering, modal opens, and button hovers using `framer-motion`.
- **Responsive**: Fully functional on mobile and desktop.

## 7. Testing Strategy

- **Unit Tests**: Coverage for `kmz-parser.ts` (parsing/generation logic) and `place-utils.ts` (name formatting, emoji mapping).
- **E2E Tests**: Playwright scripts to verify file upload, filtering, editing, and visual regressions (dashboard and modal snapshots).

## 8. Architecture & Integration

- **Module Federation**: Exposes a `Renderer` component that can be consumed by a host application.
- **Standalone Mode**: Configurable for development and testing without a host.
- **Asset Management**: Tailwind styles are decoupled to allow partial extraction or global sharing in a microfrontend environment.
