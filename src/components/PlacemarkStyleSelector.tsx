import React from 'react';
import { Palette } from 'lucide-react';
import { STYLE_OPTIONS, getColorFromStyle } from '../lib/place-utils';

interface PlacemarkStyleSelectorProps {
    styleUrl?: string;
    isEditing: boolean;
    onChange: (styleUrl?: string) => void;
}

export const PlacemarkStyleSelector: React.FC<PlacemarkStyleSelectorProps> = ({
    styleUrl,
    isEditing,
    onChange
}) => {
    const currentColor = getColorFromStyle(styleUrl);

    if (!isEditing) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-sm">
                    <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: currentColor || '#ccc' }}
                    />
                    <span className="font-semibold">Placemark Style</span>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                    {(styleUrl || 'Default').replace(/^#placemark-/, '')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-sm">
                <Palette className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">Placemark Style</span>
                <div
                    className="w-3 h-3 rounded-full border border-gray-300 ml-auto"
                    style={{ backgroundColor: currentColor || '#ccc' }}
                />
            </div>
            <div className="ml-7 space-y-2 max-w-[calc(100%-28px)]">
                <select
                    className="w-full bg-white border rounded p-1 text-xs"
                    value={(styleUrl || '').replace(/^#/, '')}
                    onChange={e => onChange(e.target.value ? `#${e.target.value}` : undefined)}
                >
                    <option value="">Default</option>
                    {STYLE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.replace('placemark-', '')}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
