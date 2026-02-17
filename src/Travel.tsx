import { useState, useEffect } from 'react';
import { Place, KMZData } from './types/travel';
import { parseKMZ, exportKMZ } from './lib/kmz-parser';
import { TravelCard } from './components/TravelCard';
import { Import, Search, X, MapPin, Calendar, Type, Globe, Info, Download, Edit2, Save, Trash2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';

export const Travel = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Place>>({});

    // 1. Initial sample place
    useEffect(() => {
        const samplePlace: Place = {
            id: 'sample-1',
            name: 'Pura Tanah Lot',
            description: 'Un templo icónico en un islote rocoso, famoso por sus vistas al atardecer.',
            timestamp: new Date().toISOString(),
            coordinates: { lat: -8.6212, lng: 115.0868 },
            extendedData: {
                featureTypes: ['tourism-attraction'],
                icon: 'Sights',
                visibility: true
            }
        };
        setPlaces([samplePlace]);
    }, []);

    // 2. Import and merge logic
    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const data = await parseKMZ(file);
            setPlaces(prev => {
                const existingNames = new Set(prev.map(p => p.name));
                const newPlaces = data.places.filter(p => !existingNames.has(p.name));
                return [...prev, ...newPlaces];
            });
        } catch (error) {
            console.error('Failed to parse KMZ:', error);
            alert('Error parsing KMZ file');
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset input
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

    const startEditing = (place: Place) => {
        setEditForm({ ...place });
        setIsEditing(true);
    };

    const saveEdit = () => {
        if (!editForm.id) return;
        setPlaces(prev => prev.map(p => p.id === editForm.id ? { ...p, ...editForm } as Place : p));
        setIsEditing(false);
    };

    const deletePlace = (id: string) => {
        if (confirm('Are you sure you want to delete this place?')) {
            setPlaces(prev => prev.filter(p => p.id !== id));
            setSelectedPlaceId(null);
        }
    };

    const filteredPlaces = places.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.extendedData?.featureTypes?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedPlace = places.find(p => p.id === selectedPlaceId);

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-card shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Globe className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Travel Planner</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">KMZ Explorer</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Search places..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-muted/50 border rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="relative cursor-pointer">
                            <input
                                type="file"
                                accept=".kmz,.kml"
                                className="hidden"
                                onChange={handleFileImport}
                                disabled={isImporting}
                            />
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95",
                                isImporting && "animate-pulse grayscale cursor-wait"
                            )}>
                                <Import className="w-4 h-4" />
                                <span>{isImporting ? 'Parsing...' : 'Import'}</span>
                            </div>
                        </label>

                        <Button
                            onClick={handleExport}
                            disabled={places.length === 0}
                            className="rounded-full bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export KMZ</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
                {filteredPlaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="bg-muted p-6 rounded-full mb-4">
                            <MapPin className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No places found</h3>
                        <p className="text-muted-foreground">Try importing a KMZ file or adjusting your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlaces.map(place => (
                            <TravelCard
                                key={place.id}
                                place={place}
                                isSelected={selectedPlaceId === place.id}
                                onClick={() => {
                                    setSelectedPlaceId(place.id);
                                    setIsEditing(false);
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Selection Status Bar */}
            <footer className="px-6 py-2 border-t bg-card text-xs text-muted-foreground flex justify-between items-center">
                <div className="flex gap-4">
                    <span>Total Places: <strong>{places.length}</strong></span>
                    <span>Visible: <strong>{filteredPlaces.length}</strong></span>
                </div>
                <div>
                    {isImporting && <span>Importing data...</span>}
                </div>
            </footer>

            {/* Detail View / Edit Modal */}
            {selectedPlace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-300">
                        <div className="relative h-64">
                            <img
                                src={`https://picsum.photos/seed/${selectedPlace.name}/800/400`}
                                alt={selectedPlace.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <button
                                onClick={() => {
                                    setSelectedPlaceId(null);
                                    setIsEditing(false);
                                }}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-6 left-6 text-white w-full pr-12">
                                {isEditing ? (
                                    <input
                                        className="bg-black/40 border border-white/20 text-3xl font-bold w-full rounded px-2 outline-none focus:border-primary transition-all"
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                ) : (
                                    <>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                                            {selectedPlace.extendedData?.featureTypes?.[0] || 'Destination'}
                                        </h4>
                                        <h2 className="text-3xl font-bold">{selectedPlace.name}</h2>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" />
                                        Description
                                    </h5>
                                    {isEditing ? (
                                        <textarea
                                            className="w-full h-32 bg-muted/50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={editForm.description || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground leading-relaxed">
                                            {selectedPlace.description || 'No description available for this location.'}
                                        </p>
                                    )}
                                </div>

                                {!isEditing && selectedPlace.extendedData?.annotation && (
                                    <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-primary">
                                        <p className="text-sm italic">{selectedPlace.extendedData.annotation}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    {isEditing ? (
                                        <>
                                            <Button onClick={saveEdit} className="gap-2 rounded-xl">
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => startEditing(selectedPlace)} className="gap-2 rounded-xl">
                                                <Edit2 className="w-4 h-4" />
                                                Edit Place
                                            </Button>
                                            <Button variant="destructive" onClick={() => deletePlace(selectedPlace.id)} className="gap-2 rounded-xl">
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold">Coordinates</p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedPlace.coordinates.lat.toFixed(4)}, {selectedPlace.coordinates.lng.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold">Date</p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedPlace.timestamp ? new Date(selectedPlace.timestamp).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Type className="w-4 h-4 text-primary shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold">Icon Type</p>
                                            <p className="text-xs text-muted-foreground">{selectedPlace.extendedData?.icon || 'None'}</p>
                                        </div>
                                    </div>
                                </div>

                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedPlaceId(null)}
                                        className="w-full rounded-xl"
                                    >
                                        Close Details
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Travel;
