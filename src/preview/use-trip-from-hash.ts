import { useEffect, useState } from 'react';
import { decodeTripPayload, parseTrip, readTripPayload, TripDataError } from './trip-data';
import sampleTrip from './sample-trip.json';
import { Trip } from './types';

export type TripState =
    | { status: 'empty' }
    | { status: 'error'; detail: string }
    | { status: 'ready'; trip: Trip };

const SAMPLE_PAYLOAD = 'sample';

export const tripStateFromHash = (hash: string): TripState => {
    const payload = readTripPayload(hash);
    if (!payload) return { status: 'empty' };
    try {
        const trip = payload.value === SAMPLE_PAYLOAD ? parseTrip(sampleTrip) : decodeTripPayload(payload);
        return { status: 'ready', trip };
    } catch (error) {
        if (error instanceof TripDataError) return { status: 'error', detail: error.message };
        throw error;
    }
};

export const useTripFromHash = (): TripState => {
    const [state, setState] = useState(() => tripStateFromHash(window.location.hash));

    useEffect(() => {
        const onHashChange = () => setState(tripStateFromHash(window.location.hash));
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return state;
};
