import React from 'react';
import { Place } from '../types/travel';
import { X, Info, MapPin, Calendar, Type, Save, Edit2, Trash2, Globe } from 'lucide-react';
import { Button } from './ui/button';
import {
  formatPlaceName,
  getPureTitle,
  ICON_OPTIONS,
  getPlaceholderImage
} from '../lib/place-utils';
import { DateTimeSelector } from './DateTimeSelector';
import { PlacemarkStyleSelector } from './PlacemarkStyleSelector';

interface EditPlaceModalProps {
  place: Place;
  isEditing: boolean;
  editForm: Partial<Place>;
  tripStartDate?: string;
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onFormChange: (data: Partial<Place>) => void;
}

const FEATURE_TYPE_OPTIONS = [
  'tourism-attraction', 'landmark', 'restaurant', 'hotel', 'shop', 'transit-station', 'nature-reserve'
];

export const EditPlaceModal: React.FC<EditPlaceModalProps> = ({
  place,
  isEditing,
  editForm,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFormChange,
  tripStartDate
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

  const handleNameChange = (value: string) => {
    const currentTimestamp = editForm.timestamp ?? place.timestamp;
    const currentIcon = editForm.extendedData?.icon ?? place.extendedData?.icon;
    onFormChange({
      name: formatPlaceName(value, currentTimestamp, currentIcon, tripStartDate)
    });
  };

  const handleDateTimePartChange = (datePart?: string, timePart?: string) => {
    const currentIso = editForm.timestamp ?? place.timestamp;
    const date = currentIso ? new Date(currentIso) : new Date();

    if (datePart) {
      const [y, m, d] = datePart.split('-').map(Number);
      date.setFullYear(y, m - 1, d);
    }
    if (timePart) {
      const [h, min] = timePart.split(':').map(Number);
      date.setHours(h, min);
    }

    const newTimestamp = date.toISOString();
    const currentName = editForm.name ?? place.name;
    const currentIcon = editForm.extendedData?.icon ?? place.extendedData?.icon;

    onFormChange({
      timestamp: newTimestamp,
      name: formatPlaceName(currentName, newTimestamp, currentIcon, tripStartDate)
    });
  };

  const handleIconChange = (value: string) => {
    const currentName = editForm.name ?? place.name;
    const currentTimestamp = editForm.timestamp ?? place.timestamp;

    onFormChange({
      name: formatPlaceName(currentName, currentTimestamp, value, tripStartDate),
      extendedData: {
        ...place.extendedData,
        ...editForm.extendedData,
        icon: value
      }
    });
  };

  const handleFeatureTypeChange = (value: string) => {
    onFormChange({
      extendedData: {
        ...place.extendedData,
        ...editForm.extendedData,
        featureTypes: value ? [value] : []
      }
    });
  };

  const handleImageUrlChange = (value: string) => {
    onFormChange({ imageUrl: value });
  };

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;

  const currentImg = editForm.imageUrl ?? place.imageUrl ?? getPlaceholderImage(place.name, place.id, editForm.ddgImage ?? place.ddgImage, 800, 400);

  const currentFeatureType = editForm.extendedData?.featureTypes?.[0] ?? place.extendedData?.featureTypes?.[0] ?? '';

  return (
    <div className="mf-edit-place-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-300">
        <div className="relative h-64">
          <img
            src={currentImg}
            alt={place.name}
            className="w-full h-full object-cover bg-gray-600"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="mf-modal-close-button absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 left-6 text-white w-full pr-12">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  className="bg-black/40 border border-white/20 text-3xl font-bold w-full rounded px-2 outline-none focus:border-primary transition-all"
                  value={getPureTitle(editForm.name ?? place.name)}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Place name"
                />
                <input
                  className="bg-black/40 border border-white/20 text-xs w-full rounded px-2 py-1 outline-none focus:border-primary transition-all text-white/70"
                  value={editForm.imageUrl ?? place.imageUrl ?? ''}
                  onChange={e => handleImageUrlChange(e.target.value)}
                  placeholder="Custom image URL..."
                />
              </div>
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

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white overflow-y-auto max-h-[calc(100vh-20rem)]">
          <div className="md:col-span-1 space-y-6">
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

            <div className="flex flex-col gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={onSaveEdit} className="w-full gap-2 rounded-xl">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={onCancelEdit} className="w-full rounded-xl">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={onStartEdit} className="w-full gap-2 rounded-xl">
                    <Edit2 className="w-4 h-4" />
                    Edit Place
                  </Button>
                  <Button variant="destructive" onClick={onDelete} className="w-full gap-2 rounded-xl">
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
                  <DateTimeSelector
                    timestamp={editForm.timestamp ?? place.timestamp}
                    onChange={handleDateTimePartChange}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground ml-7">
                    {place.timestamp ? new Date(place.timestamp).toLocaleString() : 'Unknown'}
                  </p>
                )}
              </div>

              <PlacemarkStyleSelector
                styleUrl={editForm.styleUrl ?? place.styleUrl}
                isEditing={isEditing}
                onChange={val => onFormChange({ styleUrl: val })}
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-sm">
                  <Type className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">Feature Type</span>
                </div>
                {isEditing ? (
                  <div className="ml-7 space-y-2 max-w-[calc(100%-28px)]">
                    <select
                      className="w-full bg-white border rounded p-1 text-xs"
                      value={FEATURE_TYPE_OPTIONS.includes(currentFeatureType) ? currentFeatureType : (currentFeatureType ? 'custom' : '')}
                      onChange={e => handleFeatureTypeChange(e.target.value === 'custom' ? currentFeatureType : e.target.value)}
                    >
                      <option value="">None</option>
                      {FEATURE_TYPE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="custom">Custom...</option>
                    </select>
                    {(!FEATURE_TYPE_OPTIONS.includes(currentFeatureType) && currentFeatureType !== '') && (
                      <input
                        type="text"
                        className="w-full bg-white border rounded p-1 text-xs"
                        placeholder="Custom feature type..."
                        value={currentFeatureType}
                        onChange={e => handleFeatureTypeChange(e.target.value)}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground ml-7">{currentFeatureType || 'None'}</p>
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
                      onChange={e => handleIconChange(e.target.value === 'custom' ? (editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') : e.target.value)}
                    >
                      <option value="">None</option>
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="custom">Custom...</option>
                    </select>
                    {(!ICON_OPTIONS.includes(editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') && (editForm.extendedData?.icon ?? place.extendedData?.icon ?? '') !== '') && (
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

          {isEditing && (
            <div className="md:col-span-2 bg-primary/5 border border-primary/20 p-4 rounded-xl">
              <h6 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Auto-Formatting Information
              </h6>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The full title is automatically generated using the format: <strong>"Day. Time Emoji Title"</strong>.
                Update the <strong>Date & Time</strong> to change the schedule, and
                <strong> Icon Type</strong> to change the emoji.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
