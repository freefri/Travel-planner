#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const DEFAULT_BASE = 'https://freefri.github.io/Travel-planner/preview/';

const [file, base = DEFAULT_BASE] = process.argv.slice(2);
if (!file) {
    console.error('Usage: npm run preview:link -- <trip.json> [base-url]');
    process.exit(1);
}

// Parsing first rejects a broken file here instead of producing a link that fails in the browser.
// $schema only serves editors, so it is left out of the link to keep it short.
const { $schema, ...trip } = JSON.parse(readFileSync(file, 'utf-8'));
const payload = Buffer.from(JSON.stringify(trip)).toString('base64url');
console.log(`${base}#data:${payload}`);
