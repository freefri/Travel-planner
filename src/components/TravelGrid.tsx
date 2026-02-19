import React, { useMemo } from 'react';
import { Place } from '../types/travel';
import { TravelCard } from './TravelCard';
import { MapPin } from 'lucide-react';

interface TravelGridProps {
    places: Place[];
    selectedPlaceId: string | null;
    onPlaceSelect: (id: string) => void;
    tripStartDate?: string;
}

export const TravelGrid: React.FC<TravelGridProps> = ({
    places,
    selectedPlaceId,
    onPlaceSelect,
    tripStartDate
}) => {
    const groups = useMemo(() => {
        if (places.length === 0) return [];

        const dateMap = new Map<string, Place[]>();

        // Sort by timestamp for chronological grouping
        const sorted = [...places].sort((a, b) => {
            const tA = a.timestamp ? new Date(a.timestamp).getTime() : Infinity;
            const tB = b.timestamp ? new Date(b.timestamp).getTime() : Infinity;
            return tA - tB;
        });

        sorted.forEach(p => {
            const dateKey = p.timestamp ? p.timestamp.split('T')[0] : 'unscheduled';
            if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
            dateMap.get(dateKey)!.push(p);
        });

        const result: { label: string, places: Place[] }[] = [];
        dateMap.forEach((pList, dateKey) => {
            let label = 'Unscheduled';
            if (dateKey !== 'unscheduled' && tripStartDate) {
                const start = new Date(tripStartDate);
                const current = new Date(dateKey);
                // Calculate Day X
                const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const currentMid = new Date(current.getFullYear(), current.getMonth(), current.getDate());
                const diffDays = Math.floor((currentMid.getTime() - startMid.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const formattedDate = current.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                label = `Day ${diffDays} — ${formattedDate}`;
            } else if (dateKey !== 'unscheduled') {
                label = new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            }
            result.push({ label, places: pList });
        });

        return result;
    }, [places, tripStartDate]);

    if (places.length === 0) {
        return (
            <div className="mf-travel-grid empty flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-muted p-6 rounded-full mb-4">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No places found</h3>
                <p className="text-muted-foreground">Try importing a KMZ file or adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="mf-travel-grid space-y-12">
            {groups.map((group, idx) => (
                <div key={group.label} className="space-y-6">
                    {/* Day Divider & Header */}
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                            {group.label}
                        </h2>
                        <div className="h-[1px] flex-1 bg-border" />
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {group.places.map(place => (
                            <TravelCard
                                key={place.id}
                                place={place}
                                isSelected={selectedPlaceId === place.id}
                                onClick={() => onPlaceSelect(place.id)}
                            />
                        ))}
                    </div>

                    {/* Optional bottom margin if not the last group */}
                    {idx < groups.length - 1 && <div className="h-4" />}
                </div>
            ))}
        </div>
    );
};
