export interface TripPhoto {
    src: string;
    alt?: string;
    title?: string;
    caption?: string;
    href?: string;
}

export interface TransportRow {
    route: string;
    duration?: string;
    note?: string;
}

export interface TransportBlock {
    type: 'transport';
    rows: TransportRow[];
}

export interface CalloutBlock {
    type: 'callout';
    title?: string;
    text: string;
}

export interface StopBlock {
    type: 'stop';
    id?: string;
    dates?: string;
    summary?: string;
    meta?: string;
    title: string;
    text?: string;
    bullets?: string[];
    tags?: string[];
    photos?: TripPhoto[];
}

export interface TripCard {
    title: string;
    text?: string;
    bullets?: string[];
}

export interface CardsBlock {
    type: 'cards';
    cards: TripCard[];
}

export interface ChecklistItem {
    title: string;
    text?: string;
}

export interface ChecklistBlock {
    type: 'checklist';
    items: ChecklistItem[];
}

export interface NoteBlock {
    type: 'note';
    text: string;
}

export type TripBlock =
    | TransportBlock
    | CalloutBlock
    | StopBlock
    | CardsBlock
    | ChecklistBlock
    | NoteBlock;

export type TripBlockType = TripBlock['type'];

export interface TripSection {
    id: string;
    navLabel?: string;
    eyebrow?: string;
    title: string;
    intro?: string;
    blocks: TripBlock[];
}

export interface TripHero {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    image?: string;
    pills?: string[];
}

export interface TripLabels {
    transportRoute: string;
    transportDuration: string;
    transportNote: string;
}

export interface Trip {
    lang?: string;
    title?: string;
    hero: TripHero;
    sections: TripSection[];
    footer?: string;
    labels?: Partial<TripLabels>;
}
