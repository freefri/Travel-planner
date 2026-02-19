import React from 'react';
import { Globe, Search, Import, Download } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { EMOJI_MAP } from '../lib/place-utils';

interface TravelHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dateFilter: string;
    onDateFilterChange: (date: string) => void;
    iconFilter: string;
    onIconFilterChange: (icon: string) => void;
    availableIcons: string[];
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    isImporting: boolean;
    hasPlaces: boolean;
}

export const TravelHeader: React.FC<TravelHeaderProps> = ({
    searchQuery,
    onSearchChange,
    dateFilter,
    onDateFilterChange,
    iconFilter,
    onIconFilterChange,
    availableIcons,
    onImport,
    onExport,
    isImporting,
    hasPlaces
}) => {
    return (
        <header className="mf-travel-header flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b bg-card shadow-sm z-10 gap-4">
            <div className="flex items-center gap-3 self-start md:self-center">
                <div className="bg-primary p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Travel Planner</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">KMZ Explorer</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-2 flex-grow md:flex-grow-0">
                    <div className="relative group flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Search places..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-muted/50 border rounded-full text-sm w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => onDateFilterChange(e.target.value)}
                        className="px-3 py-2 bg-muted/50 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        title="Filter by date"
                    />

                    <select
                        value={iconFilter}
                        onChange={(e) => onIconFilterChange(e.target.value)}
                        className="px-3 py-2 bg-muted/50 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[120px]"
                    >
                        <option value="">All types</option>
                        {availableIcons.map(icon => (
                            <option key={icon} value={icon}>
                                {EMOJI_MAP[icon] ? `${EMOJI_MAP[icon]} ${icon}` : icon}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="relative cursor-pointer">
                        <input
                            type="file"
                            accept=".kmz,.kml"
                            className="hidden"
                            onChange={onImport}
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
                        onClick={onExport}
                        disabled={!hasPlaces}
                        className="rounded-full bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export KMZ</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};
