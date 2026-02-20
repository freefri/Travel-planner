import { useState, useEffect, useCallback, useMemo } from 'react';
import { Place, KMZData } from './types/travel';
import { parseKMZ, exportKMZ } from './lib/kmz-parser';
import { syncPlaceName, fetchDuckDuckGoData } from './lib/place-utils';
import { TravelGrid } from './components/TravelGrid';
import { TravelHeader } from './components/TravelHeader';
import { EditPlaceModal } from './components/EditPlaceModal';
import { StatsFooter } from './components/StatsFooter';

export const Travel = () => {
  // --- State ---
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [iconFilter, setIconFilter] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Place>>({});
  const [searchedIds, setSearchedIds] = useState<Set<string>>(new Set());

  // --- Effects ---
  useEffect(() => {
    const samplePlace: Place = {
      id: 'sample-1',
      name: 'Pura Tanah Lot',
      description: 'Tanah Lot es una formación rocosa junto a la costa sur de la isla de Bali. La roca es conocida por el pura (templo hindú balinés) allí existente, llamado Pura Tanah Lot (literalmente Templo de Tanah Lot), un lugar de peregrinación que también es muy popular entre los turistas y una de las imágenes icónicas de Bali. &lt;img src=&quot;https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bali_-_Pura_Tanah_Lot%2C_20220827_1005_1141.jpg/330px-Bali_-_Pura_Tanah_Lot%2C_20220827_1005_1141.jpg&quot; style=&quot;max-width:300px; display:block; margin: 10px 0;&quot;&gt;',
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

  // --- Enrichment Effect ---
  useEffect(() => {
    const enrichMissingData = async () => {
      const placesToSearch = places.filter(p =>
        !searchedIds.has(p.id) && (!p.description || !p.ddgImage)
      );

      if (placesToSearch.length === 0) return;

      // Mark them as searched immediately to avoid repeated calls
      setSearchedIds(prev => {
        const next = new Set(prev);
        placesToSearch.forEach(p => next.add(p.id));
        return next;
      });

      // Fetch sequentially to avoid overwhelming the API
      for (const place of placesToSearch) {
        const data = await fetchDuckDuckGoData(place.name);
        if (data) {
          setPlaces(prev => prev.map(p => p.id === place.id ? {
            ...p,
            description: p.description || data.abstract || p.description,
            ddgImage: data.image || p.ddgImage
          } : p));
        }
      }
    };

    enrichMissingData();
  }, [places, searchedIds]);

  // --- Derived Data ---
  const availableIcons = useMemo(() => {
    const icons = new Set<string>();
    places.forEach(p => {
      if (p.extendedData?.icon) icons.add(p.extendedData.icon);
    });
    return Array.from(icons).sort();
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

      const matchesIcon = !iconFilter || p.extendedData?.icon === iconFilter;

      return matchesSearch && matchesDate && matchesIcon;
    });
  }, [places, searchQuery, dateFilter, iconFilter]);

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
  return (
    <div className="mf-travel flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      <TravelHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        iconFilter={iconFilter}
        onIconFilterChange={setIconFilter}
        availableIcons={availableIcons}
        onImport={handleFileImport}
        onExport={handleExport}
        isImporting={isImporting}
        hasPlaces={places.length > 0}
      />

      <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
        <TravelGrid
          places={filteredPlaces}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={handlePlaceSelect}
          tripStartDate={tripStartDate}
        />
      </main>

      <StatsFooter
        totalCount={places.length}
        visibleCount={filteredPlaces.length}
        isImporting={isImporting}
      />

      {selectedPlace && (
        <EditPlaceModal
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
