import {
    CardsBlock,
    ChecklistBlock,
    StopBlock,
    TransportBlock,
    Trip,
    TripBlock,
    TripBlockType,
    TripLabels,
    TripPhoto,
    TripSection,
} from './types';

export type TripPayloadFormat = 'base64' | 'json';

export interface TripPayload {
    format: TripPayloadFormat;
    value: string;
}

const PAYLOAD_PREFIXES: Record<string, TripPayloadFormat> = {
    '#data:': 'base64',
    '#json:': 'json',
};

export class TripDataError extends Error {
    name = 'TripDataError';
}

export const readTripPayload = (hash: string): TripPayload | null => {
    for (const [prefix, format] of Object.entries(PAYLOAD_PREFIXES)) {
        if (hash.startsWith(prefix)) {
            const value = hash.slice(prefix.length);
            return value ? { format, value } : null;
        }
    }
    return null;
};

export const encodeTrip = (trip: Trip): string => {
    const bytes = new TextEncoder().encode(JSON.stringify(trip));
    let binary = '';
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeTrip = (payload: string): Trip => {
    let json: unknown;
    try {
        json = JSON.parse(base64ToText(payload));
    } catch {
        throw new TripDataError('The trip data is not valid base64-encoded JSON');
    }
    return parseTrip(json);
};

// Browsers percent-encode spaces and quotes in the hash, but hand-written JSON may also hold a bare
// "%" (e.g. "50%"), which is not valid percent-encoding, so the raw text is the fallback.
export const decodeJsonTrip = (payload: string): Trip => {
    let json: unknown;
    try {
        json = JSON.parse(safeDecodeURIComponent(payload));
    } catch {
        throw new TripDataError('The trip data is not valid JSON');
    }
    return parseTrip(json);
};

export const decodeTripPayload = ({ format, value }: TripPayload): Trip =>
    format === 'json' ? decodeJsonTrip(value) : decodeTrip(value);

// Links get pasted through chats and editors, so both base64 alphabets, missing padding and
// percent-encoding are accepted.
const base64ToText = (payload: string): string => {
    const base64 = safeDecodeURIComponent(payload)
        .replace(/\s/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

const safeDecodeURIComponent = (value: string): string => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

type Parser<T> = (value: unknown, path: string) => T;

const fail = (path: string, expected: string): never => {
    throw new TripDataError(`${path}: expected ${expected}`);
};

const record = (value: unknown, path: string): Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : fail(path, 'an object');

const text: Parser<string> = (value, path) => (typeof value === 'string' ? value : fail(path, 'a string'));

const optional =
    <T,>(parse: Parser<T>): Parser<T | undefined> =>
    (value, path) =>
        value === undefined ? undefined : parse(value, path);

const list =
    <T,>(parseItem: Parser<T>): Parser<T[]> =>
    (value, path) =>
        Array.isArray(value) ? value.map((item, i) => parseItem(item, `${path}[${i}]`)) : fail(path, 'an array');

const optionalText = optional(text);
const optionalTexts = optional(list(text));

const parsePhoto: Parser<TripPhoto> = (value, path) => {
    const v = record(value, path);
    return {
        src: text(v.src, `${path}.src`),
        alt: optionalText(v.alt, `${path}.alt`),
        title: optionalText(v.title, `${path}.title`),
        caption: optionalText(v.caption, `${path}.caption`),
        href: optionalText(v.href, `${path}.href`),
    };
};

const parseTransport = (v: Record<string, unknown>, path: string): TransportBlock => ({
    type: 'transport',
    rows: list((row, rowPath) => {
        const r = record(row, rowPath);
        return {
            route: text(r.route, `${rowPath}.route`),
            duration: optionalText(r.duration, `${rowPath}.duration`),
            note: optionalText(r.note, `${rowPath}.note`),
        };
    })(v.rows, `${path}.rows`),
});

const parseStop = (v: Record<string, unknown>, path: string): StopBlock => ({
    type: 'stop',
    id: optionalText(v.id, `${path}.id`),
    dates: optionalText(v.dates, `${path}.dates`),
    summary: optionalText(v.summary, `${path}.summary`),
    meta: optionalText(v.meta, `${path}.meta`),
    title: text(v.title, `${path}.title`),
    text: optionalText(v.text, `${path}.text`),
    bullets: optionalTexts(v.bullets, `${path}.bullets`),
    tags: optionalTexts(v.tags, `${path}.tags`),
    photos: optional(list(parsePhoto))(v.photos, `${path}.photos`),
});

const parseCards = (v: Record<string, unknown>, path: string): CardsBlock => ({
    type: 'cards',
    cards: list((card, cardPath) => {
        const c = record(card, cardPath);
        return {
            title: text(c.title, `${cardPath}.title`),
            text: optionalText(c.text, `${cardPath}.text`),
            bullets: optionalTexts(c.bullets, `${cardPath}.bullets`),
        };
    })(v.cards, `${path}.cards`),
});

const parseChecklist = (v: Record<string, unknown>, path: string): ChecklistBlock => ({
    type: 'checklist',
    items: list((item, itemPath) => {
        const c = record(item, itemPath);
        return { title: text(c.title, `${itemPath}.title`), text: optionalText(c.text, `${itemPath}.text`) };
    })(v.items, `${path}.items`),
});

const blockParsers: Record<TripBlockType, (v: Record<string, unknown>, path: string) => TripBlock> = {
    transport: parseTransport,
    stop: parseStop,
    cards: parseCards,
    checklist: parseChecklist,
    callout: (v, path) => ({
        type: 'callout',
        title: optionalText(v.title, `${path}.title`),
        text: text(v.text, `${path}.text`),
    }),
    note: (v, path) => ({ type: 'note', text: text(v.text, `${path}.text`) }),
};

const isBlockType = (type: unknown): type is TripBlockType =>
    typeof type === 'string' && Object.hasOwn(blockParsers, type);

const parseBlock: Parser<TripBlock> = (value, path) => {
    const v = record(value, path);
    if (!isBlockType(v.type)) return fail(`${path}.type`, `one of ${Object.keys(blockParsers).join(', ')}`);
    return blockParsers[v.type](v, path);
};

const parseSection: Parser<TripSection> = (value, path) => {
    const v = record(value, path);
    return {
        id: text(v.id, `${path}.id`),
        navLabel: optionalText(v.navLabel, `${path}.navLabel`),
        eyebrow: optionalText(v.eyebrow, `${path}.eyebrow`),
        title: text(v.title, `${path}.title`),
        intro: optionalText(v.intro, `${path}.intro`),
        blocks: list(parseBlock)(v.blocks, `${path}.blocks`),
    };
};

const parseLabels: Parser<Partial<TripLabels>> = (value, path) => {
    const v = record(value, path);
    return Object.fromEntries(Object.keys(v).map((key) => [key, text(v[key], `${path}.${key}`)]));
};

export const parseTrip = (value: unknown): Trip => {
    const v = record(value, 'trip');
    const hero = record(v.hero, 'hero');
    return {
        lang: optionalText(v.lang, 'lang'),
        title: optionalText(v.title, 'title'),
        hero: {
            eyebrow: optionalText(hero.eyebrow, 'hero.eyebrow'),
            title: text(hero.title, 'hero.title'),
            subtitle: optionalText(hero.subtitle, 'hero.subtitle'),
            image: optionalText(hero.image, 'hero.image'),
            pills: optionalTexts(hero.pills, 'hero.pills'),
        },
        sections: list(parseSection)(v.sections, 'sections'),
        footer: optionalText(v.footer, 'footer'),
        labels: optional(parseLabels)(v.labels, 'labels'),
    };
};
