import React from 'react';
import { Place } from '../types/travel';
import { X, Info, MapPin, Calendar, Type, Save, Edit2, Trash2, Globe } from 'lucide-react';
import { Button } from './ui/button';

interface PlaceModalProps {
    place: Place;
    isEditing: boolean;
    editForm: Partial<Place>;
    onClose: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDelete: () => void;
    onFormChange: (data: Partial<Place>) => void;
}

const ICON_OPTIONS = [
    'Airport', 'FastFood', 'Food', 'Hotel', 'Information', 'Shop', 'Sights', 'Swim', 'Theatre', 'Transport', 'Viewpoint'
];

export const PlaceModal: React.FC<PlaceModalProps> = ({
    place,
    isEditing,
    editForm,
    onClose,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    onFormChange
}) => {
    const handleCoordChange = (key: 'lat' | 'lng', value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            onFormChange({
                coordinates: {
                    ...place.coordinates,
                    ...editForm.coordinates,
                    [key]: numValue
                }
            });
        }
    };

    const handleDateTimeChange = (value: string) => {
        if (value) {
            onFormChange({ timestamp: new Date(value).toISOString() });
        }
    };

    const handleIconChange = (value: string) => {
        onFormChange({
            extendedData: {
                ...place.extendedData,
                ...editForm.extendedData,
                icon: value
            }
        });
    };

    // Helper to format ISO to YYYY-MM-DDTHH:mm for datetime-local input
    const formatDateTimeForInput = (iso?: string) => {
        if (!iso) return '';
        const date = new Date(iso);
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;

    return (
        <div className="mf-place-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-300">
                <div className="relative h-64">
                    <img
                        src={`https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/400`}
                        alt={place.name}
                        className="w-full h-full object-cover bg-gray-600"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-6 left-6 text-white w-full pr-12">
                        {isEditing ? (
                            <input
                                className="bg-black/40 border border-white/20 text-3xl font-bold w-full rounded px-2 outline-none focus:border-primary transition-all"
                                value={editForm.name ?? place.name}
                                onChange={e => onFormChange({ name: e.target.value })}
                                placeholder="Place name"
                            />
                        ) : (
                            <>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                                    {place.extendedData?.featureTypes?.[0] || 'Destination'}
                                </h4>
                                <h2 className="text-3xl font-bold">{place.name}</h2>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Description
                            </h5>
                            {isEditing ? (
                                <textarea
                                    className="w-full h-32 bg-muted/50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={editForm.description ?? place.description ?? ''}
                                    onChange={e => onFormChange({ description: e.target.value })}
                                    placeholder="Add a description..."
                                />
                            ) : (
                                <p className="text-muted-foreground leading-relaxed">
                                    {place.description || 'No description available for this location.'}
                                </p>
                            )}
                        </div>

                        {!isEditing && place.extendedData?.annotation && (
                            <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-primary">
                                <p className="text-sm italic">{place.extendedData.annotation}</p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            {isEditing ? (
                                <>
                                    <Button onClick={onSaveEdit} className="gap-2 rounded-xl">
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={onCancelEdit} className="rounded-xl">
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={onStartEdit} className="gap-2 rounded-xl">
                                        <Edit2 className="w-4 h-4" />
                                        Edit Place
                                    </Button>
                                    <Button variant="destructive" onClick={onDelete} className="gap-2 rounded-xl">
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    <span className="font-semibold">Coordinates</span>
                                </div>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div className="space-y-1 text-xs">
                                            <span className="text-muted-foreground">LAT</span>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="w-full bg-white border rounded p-1 text-xs"
                                                value={editForm.coordinates?.lat ?? place.coordinates.lat}
                                                onChange={e => handleCoordChange('lat', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <span className="text-muted-foreground">LNG</span>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="w-full bg-white border rounded p-1 text-xs"
                                                value={editForm.coordinates?.lng ?? place.coordinates.lng}
                                                onChange={e => handleCoordChange('lng', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <a
                                        href={gmapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1 ml-7 mt-0.5"
                                    >
                                        {place.coordinates.lat.toFixed(6)}, {place.coordinates.lng.toFixed(6)}
                                        <Globe className="w-3 h-3" />
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                                    <span className="font-semibold">Date & Time</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-white border rounded p-1 text-xs ml-7 max-w-[calc(100%-28px)]"
                                        value={formatDateTimeForInput(editForm.timestamp ?? place.timestamp)}
                                        onChange={e => handleDateTimeChange(e.target.value)}
                                    />
                                ) : (
                                    <p className="text-xs text-muted-foreground ml-7">
                                        {place.timestamp ? new Date(place.timestamp).toLocaleString() : 'Unknown'}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 text-sm">
                                    <Type className="w-4 h-4 text-primary shrink-0" />
                                    <span className="font-semibold">Icon Type</span>
                                </div>
                                {isEditing ? (
                                    <div className="ml-7 space-y-2 max-w-[calc(100%-28px)]">
                                        <select
                                            className="w-full bg-white border rounded p-1 text-xs"
                                            value={ICON_OPTIONS.includes(editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') ? (editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') : 'custom'}
                                            onChange={e => handleIconChange(e.target.value === 'custom' ? '' : e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {ICON_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                            <option value="custom">Custom...</option>
                                        </select>
                                        {(!ICON_OPTIONS.includes(editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') || (editForm.extendedData?.icon === '')) && (
                                            <input
                                                type="text"
                                                className="w-full bg-white border rounded p-1 text-xs"
                                                placeholder="Custom icon name"
                                                value={editForm.extendedData?.icon ?? place.extendedData?.icon ?? ''}
                                                onChange={e => handleIconChange(e.target.value)}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground ml-7">{place.extendedData?.icon || 'None'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
