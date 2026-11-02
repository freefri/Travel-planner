import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import schema from './trip.schema.json';
import sampleTrip from './sample-trip.json';
import { DEFAULT_LABELS } from './labels';
import { parseTrip } from './trip-data';
import { TripBlockType } from './types';

const validate = new Ajv2020({ allErrors: true }).compile(schema);

// Typed against the union, so adding a block type to types.ts without updating this list fails type-check.
const BLOCK_TYPES: Record<TripBlockType, true> = {
    transport: true,
    callout: true,
    stop: true,
    cards: true,
    checklist: true,
    note: true,
};

describe('trip.schema.json', () => {
    it('accepts the bundled sample', () => {
        expect(validate(sampleTrip), JSON.stringify(validate.errors)).toBe(true);
    });

    it('accepts what the app parses back out of the sample', () => {
        expect(validate(JSON.parse(JSON.stringify(parseTrip(sampleTrip))))).toBe(true);
    });

    it('accepts its own examples', () => {
        for (const example of schema.examples) {
            expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
        }
    });

    it('lists the same block types as the app', () => {
        expect(schema.$defs.block.properties.type.enum.sort()).toEqual(Object.keys(BLOCK_TYPES).sort());
    });

    it('lists the same labels as the app', () => {
        expect(Object.keys(schema.$defs.labels.properties).sort()).toEqual(Object.keys(DEFAULT_LABELS).sort());
    });

    it('rejects what the app rejects', () => {
        expect(validate({ hero: {}, sections: [] })).toBe(false);
        expect(validate({ hero: { title: 'T' }, sections: [{ id: 'a', title: 'A', blocks: [{ type: 'video' }] }] })).toBe(
            false,
        );
    });

    it('flags misspelled fields', () => {
        expect(validate({ hero: { title: 'T', subtitel: 'typo' }, sections: [] })).toBe(false);
    });
});
