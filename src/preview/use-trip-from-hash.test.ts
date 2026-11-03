import { describe, it, expect } from 'vitest';
import { encodeTrip } from './trip-data';
import { tripStateFromHash } from './use-trip-from-hash';

describe('tripStateFromHash', () => {
    it('loads the bundled sample for #data:sample', () => {
        const state = tripStateFromHash('#data:sample');
        expect(state.status).toBe('ready');
        expect(state.status === 'ready' && state.trip.title).toBe('Viaje de ejemplo');
    });

    it('decodes any other payload as an encoded trip', () => {
        const state = tripStateFromHash(`#data:${encodeTrip({ hero: { title: 'Mine' }, sections: [] })}`);
        expect(state.status === 'ready' && state.trip.hero.title).toBe('Mine');
    });

    it('reads a trip written as JSON after #json:', () => {
        const state = tripStateFromHash(`#json:${encodeURIComponent('{"hero":{"title":"Mine"},"sections":[]}')}`);
        expect(state.status === 'ready' && state.trip.hero.title).toBe('Mine');
    });

    it('reports broken data', () => {
        expect(tripStateFromHash('#data:@@').status).toBe('error');
        expect(tripStateFromHash('#json:{').status).toBe('error');
    });

    it('is empty without data', () => {
        expect(tripStateFromHash('').status).toBe('empty');
    });
});
