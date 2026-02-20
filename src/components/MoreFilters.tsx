import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { EMOJI_MAP } from '../lib/place-utils';

interface MoreFiltersProps {
    dateFilter: string;
    onDateFilterChange: (date: string) => void;
    iconFilter: string;
    onIconFilterChange: (icon: string) => void;
    availableIcons: string[];
}

export const MoreFilters: React.FC<MoreFiltersProps> = ({
    dateFilter,
    onDateFilterChange,
    iconFilter,
    onIconFilterChange,
    availableIcons
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasActiveFilters = dateFilter !== '' || iconFilter !== '';

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${hasActiveFilters ? 'border-primary text-primary bg-primary/5' : ''
                    }`}
            >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
                {hasActiveFilters && (
                    <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-card bg-white border rounded-xl shadow-xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Filter by Date
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => onDateFilterChange(e.target.value)}
                            className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Filter by Category
                        </label>
                        <select
                            value={iconFilter}
                            onChange={(e) => onIconFilterChange(e.target.value)}
                            className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All types</option>
                            {availableIcons.map(icon => (
                                <option key={icon} value={icon}>
                                    {EMOJI_MAP[icon] ? `${EMOJI_MAP[icon]} ${icon}` : icon}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(dateFilter || iconFilter) && (
                        <button
                            onClick={() => {
                                onDateFilterChange('');
                                onIconFilterChange('');
                            }}
                            className="text-xs text-primary hover:underline w-full text-center py-1 mt-2"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
