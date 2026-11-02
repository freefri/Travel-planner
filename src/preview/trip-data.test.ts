import { describe, it, expect } from 'vitest';
import { decodeTrip, encodeTrip, readTripPayload, TripDataError } from './trip-data';
import { Trip } from './types';

const trip: Trip = {
    lang: 'es',
    hero: { title: 'Viaje\nde ejemplo', pills: ['3 días · 2 noches'] },
    sections: [
        {
            id: 'ruta',
            title: 'El itinerario',
            blocks: [
                { type: 'transport', rows: [{ route: 'Ciudad A → Ciudad B', duration: '2 h' }] },
                { type: 'stop', title: 'Ciudad B', photos: [{ src: 'https://example.com/a.jpg' }] },
            ],
        },
    ],
};

const toBase64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64');

describe('readTripPayload', () => {
    it('returns the payload after #data:', () => {
        expect(readTripPayload('#data:abc123')).toBe('abc123');
    });

    it('returns null when the hash carries no data', () => {
        expect(readTripPayload('')).toBeNull();
        expect(readTripPayload('#ruta')).toBeNull();
        expect(readTripPayload('#data:')).toBeNull();
    });
});

describe('decodeTrip', () => {
    it('round-trips a trip with non-ASCII text', () => {
        expect(decodeTrip(encodeTrip(trip))).toEqual(trip);
    });

    it('produces URL-safe output without padding', () => {
        expect(encodeTrip(trip)).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('accepts standard padded base64', () => {
        expect(toBase64(trip)).toMatch(/[+/=]/);
        expect(decodeTrip(toBase64(trip))).toEqual(trip);
    });

    it('accepts a percent-encoded payload', () => {
        expect(decodeTrip(encodeURIComponent(toBase64(trip)))).toEqual(trip);
    });

    it('rejects text that is not base64', () => {
        expect(() => decodeTrip('not base64!')).toThrow(TripDataError);
    });

    it('rejects base64 that is not JSON', () => {
        expect(() => decodeTrip(Buffer.from('hola').toString('base64'))).toThrow(TripDataError);
    });

    it('rejects a trip without a hero title, naming the field', () => {
        const broken = { ...trip, hero: {} };
        expect(() => decodeTrip(toBase64(broken))).toThrow('hero.title');
    });

    it('rejects an unknown block type, naming where it is', () => {
        const broken = { ...trip, sections: [{ id: 'x', title: 'X', blocks: [{ type: 'video' }] }] };
        expect(() => decodeTrip(toBase64(broken))).toThrow('sections[0].blocks[0].type');
    });

    it('rejects a photo without a src', () => {
        const broken = {
            ...trip,
            sections: [{ id: 'x', title: 'X', blocks: [{ type: 'stop', title: 'S', photos: [{ alt: 'a' }] }] }],
        };
        expect(() => decodeTrip(toBase64(broken))).toThrow('sections[0].blocks[0].photos[0].src');
    });
});
