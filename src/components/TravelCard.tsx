import React from 'react';
import { Place } from '../types/travel';
import { MapPin, Calendar, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { getColorFromStyle, getPlaceholderImage } from '../lib/place-utils';

interface TravelCardProps {
    place: Place;
    isSelected?: boolean;
    onClick?: () => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ place, isSelected, onClick }) => {
    const dateStr = place.timestamp ? new Date(place.timestamp).toLocaleDateString() : 'No date';
    const styleColor = getColorFromStyle(place.styleUrl);

    // Use custom image or deterministic "random" image from picsum
    const bgImage = place.imageUrl || getPlaceholderImage(place.name, place.id, place.ddgImage, 400, 200);

    return (
        <div
            onClick={onClick}
            className={cn(
                "mf-travel-card relative group cursor-pointer overflow-hidden rounded-xl border-3 transition-all duration-300 hover:shadow-2xl",
                isSelected ? "ring-2 ring-primary border-primary shadow-lg" : "border-transparent"
            )}
            style={(!isSelected && styleColor) ? { borderColor: styleColor } : {}}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gray-600"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="relative h-48 p-4 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary bg-opacity-50 bg-white rounded" style={{ color: styleColor || '#ccc' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                        {place.extendedData?.featureTypes?.[0] || 'Point of Interest'}
                    </span>
                </div>

                <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                    {place.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3" />
                        <span>Details</span>
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-md">
                    <Info className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};
