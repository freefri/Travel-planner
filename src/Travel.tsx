import { useState, useEffect, useCallback, useMemo } from 'react';
import { Place, KMZData } from './types/travel';
import { parseKMZ, exportKMZ } from './lib/kmz-parser';
import { syncPlaceName } from './lib/place-utils';
import { TravelCard } from './components/TravelCard';
import { TravelHeader } from './components/TravelHeader';
import { PlaceModal } from './components/PlaceModal';
import { StatsFooter } from './components/StatsFooter';
import { MapPin } from 'lucide-react';

export const Travel = () => {
    // --- State ---
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Place>>({});

    // --- Effects ---
    useEffect(() => {
        const samplePlace: Place = {
            id: 'sample-1',
            name: 'Pura Tanah Lot',
            description: 'Un templo icónico en un islote rocoso, famoso por sus vistas al atardecer.',
            timestamp: new Date(Date.UTC(2026, 1, 19, 8, 20, 30)).toISOString(),
            coordinates: { lat: -8.6212, lng: 115.0868 },
            extendedData: {
                featureTypes: ['tourism-attraction'],
                icon: 'Sights',
                visibility: true
            }
        };
        setPlaces([syncPlaceName(samplePlace)]);
    }, []);

    // --- Derived Data ---
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        places.forEach(p => {
            p.extendedData?.featureTypes?.forEach(t => types.add(t));
        });
        return Array.from(types).sort();
    }, [places]);

    const tripStartDate = useMemo(() => {
        if (places.length === 0) return undefined;
        const dates = places
            .map(p => p.timestamp ? new Date(p.timestamp).getTime() : Infinity)
            .filter(t => t !== Infinity);
        if (dates.length === 0) return undefined;
        return new Date(Math.min(...dates)).toISOString();
    }, [places]);

    const filteredPlaces = useMemo(() => {
        return places.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.extendedData?.featureTypes?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesDate = !dateFilter || (p.timestamp && p.timestamp.startsWith(dateFilter));

            const matchesType = !typeFilter || p.extendedData?.featureTypes?.includes(typeFilter);

            return matchesSearch && matchesDate && matchesType;
        });
    }, [places, searchQuery, dateFilter, typeFilter]);

    const selectedPlace = useMemo(() => {
        return places.find(p => p.id === selectedPlaceId);
    }, [places, selectedPlaceId]);

    // --- Handlers ---
    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const data = await parseKMZ(file);
            setPlaces(prev => {
                const combined = [...prev, ...data.places];
                // Sync all names based on the final trip start date
                const earliest = combined.reduce((acc, p) => {
                    if (!p.timestamp) return acc;
                    const t = new Date(p.timestamp).getTime();
                    return t < acc ? t : acc;
                }, Infinity);
                const tripStart = earliest === Infinity ? undefined : new Date(earliest).toISOString();

                return combined.map(p => syncPlaceName(p, tripStart));
            });
        } catch (error) {
            console.error('Failed to parse KMZ:', error);
            alert('Error parsing KMZ file');
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const handleExport = async () => {
        const data: KMZData = {
            name: 'Exported Travel Plan',
            places: places,
            lastModified: new Date().toISOString()
        };
        const blob = await exportKMZ(data);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'travel-plan.kmz';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePlaceSelect = useCallback((id: string) => {
        setSelectedPlaceId(id);
        setIsEditing(false);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedPlaceId(null);
        setIsEditing(false);
    }, []);

    const startEditing = useCallback((place: Place) => {
        setEditForm({ ...place });
        setIsEditing(true);
    }, []);

    const saveEdit = useCallback(() => {
        if (!editForm.id) return;
        setPlaces(prev => {
            const updated = prev.map(p => p.id === editForm.id ? { ...p, ...editForm } as Place : p);
            // Re-sync all names in case trip start changed or name format needs updating
            const earliest = updated.reduce((acc, p) => {
                if (!p.timestamp) return acc;
                const t = new Date(p.timestamp).getTime();
                return t < acc ? t : acc;
            }, Infinity);
            const tripStart = earliest === Infinity ? undefined : new Date(earliest).toISOString();
            return updated.map(p => syncPlaceName(p, tripStart));
        });
        setIsEditing(false);
    }, [editForm]);

    const deletePlace = useCallback((id: string) => {
        if (confirm('Are you sure you want to delete this place?')) {
            setPlaces(prev => prev.filter(p => p.id !== id));
            setSelectedPlaceId(null);
        }
    }, []);

    const handleFormChange = (updates: Partial<Place>) => {
        setEditForm(prev => ({ ...prev, ...updates }));
    };

    // --- Render Helpers ---
    const renderContent = () => {
        if (filteredPlaces.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="bg-muted p-6 rounded-full mb-4">
                        <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No places found</h3>
                    <p className="text-muted-foreground">Try importing a KMZ file or adjusting your search.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlaces.map(place => (
                    <TravelCard
                        key={place.id}
                        place={place}
                        isSelected={selectedPlaceId === place.id}
                        onClick={() => handlePlaceSelect(place.id)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="mf-travel flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
            <TravelHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                availableTypes={availableTypes}
                onImport={handleFileImport}
                onExport={handleExport}
                isImporting={isImporting}
                hasPlaces={places.length > 0}
            />

            <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
                {renderContent()}
            </main>

            <StatsFooter
                totalCount={places.length}
                visibleCount={filteredPlaces.length}
                isImporting={isImporting}
            />

            {selectedPlace && (
                <PlaceModal
                    place={selectedPlace}
                    isEditing={isEditing}
                    editForm={editForm}
                    tripStartDate={tripStartDate}
                    onClose={handleCloseModal}
                    onStartEdit={() => startEditing(selectedPlace)}
                    onCancelEdit={() => setIsEditing(false)}
                    onSaveEdit={saveEdit}
                    onDelete={() => deletePlace(selectedPlace.id)}
                    onFormChange={handleFormChange}
                />
            )}
        </div>
    );
};

export default Travel;
