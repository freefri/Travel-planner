
import { Place } from '../types/travel';

export const EMOJI_MAP: Record<string, string> = {
    'Airport': '✈️',
    'FastFood': '🍔',
    'Food': '🍴',
    'Hotel': '🏨',
    'Information': 'ℹ️',
    'Shop': '🛍️',
    'Sights': '🏟️',
    'Swim': '🏊',
    'Theatre': '🎭',
    'Transport': '🚌',
    'Viewpoint': '🔭',
    'Nature': '🌲',
    'Beach': '🏖️',
    'Mountain': '🏔️',
    'City': '🏙️',
};

export const getEmojiForIcon = (icon?: string): string => {
    if (!icon) return '';
    return EMOJI_MAP[icon] || '';
};

/**
 * Extracts the pure title (without DDDD. HH:MM emoji)
 */
export const getPureTitle = (name: string): string => {
    // Regex matches "Day." or "Day" followed by " HH:MM" and optional emoji
    // Format: "1. 08:20 🏟️ Place Name" or "1 08:20 Place Name"
    // Using [^\s\w]+ to catch emojis with variation selectors and the 'u' flag for Unicode support
    return name.replace(/^\d+\.?\s+\d{2}:\d{2}\s+(?:[^\s\w]+\s+)?/u, '').trim();
};

/**
 * Formats a name according to: "DDDD. HH:MM <emoji> <title>"
 * @param name The current name or title
 * @param timestamp ISO timestamp
 * @param icon Icon name
 * @param tripStartDate Optional start date of the trip to calculate day index
 * @returns The formatted name
 */
export const formatPlaceName = (name: string, timestamp?: string, icon?: string, tripStartDate?: string): string => {
    if (!timestamp) return name;

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return name;

    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');

    let dddd = "1";
    if (tripStartDate) {
        const start = new Date(tripStartDate);
        // Reset both to midnight for day calculation
        const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const currentMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffMs = currentMidnight.getTime() - startMidnight.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        dddd = diffDays.toString();
    }

    const emoji = getEmojiForIcon(icon);
    const pureName = getPureTitle(name);

    return `${dddd}. ${hh}:${mm} ${emoji ? emoji + ' ' : ''}${pureName}`;
};

/**
 * Validates and fixes the name format.
 */
export const syncPlaceName = (place: Place, tripStartDate?: string): Place => {
    const newName = formatPlaceName(place.name, place.timestamp, place.extendedData?.icon, tripStartDate);
    return { ...place, name: newName };
};
