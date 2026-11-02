import { useEffect } from 'react';
import { resolveLabels } from '../labels';
import { Trip } from '../types';
import { TripHeroBanner } from './TripHeroBanner';
import { TripNav } from './TripNav';
import { TripSectionView } from './TripSectionView';

const useDocumentMeta = (trip: Trip) => {
    useEffect(() => {
        document.title = trip.title ?? trip.hero.title.replace(/\n/g, ' ');
        if (trip.lang) document.documentElement.lang = trip.lang;
    }, [trip]);
};

export const TripPage = ({ trip }: { trip: Trip }) => {
    useDocumentMeta(trip);
    const labels = resolveLabels(trip.labels);
    return (
        <div className="mf-trip-page">
            <TripHeroBanner hero={trip.hero} />
            {trip.sections.length > 1 && <TripNav sections={trip.sections} />}
            <main className="trip-main">
                {trip.sections.map((section) => (
                    <TripSectionView key={section.id} section={section} labels={labels} />
                ))}
            </main>
            <footer className="trip-footer">
                <p>
                    <strong>{trip.footer ?? trip.hero.title.replace(/\n/g, ' ')}</strong>
                </p>
            </footer>
        </div>
    );
};
