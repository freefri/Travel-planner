import React from 'react';
import { Globe, Search } from 'lucide-react';
import { TravelActions } from './TravelActions';
import { MoreFilters } from './MoreFilters';

interface TravelHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onRemoveAll: () => void;
    isImporting: boolean;
    hasPlaces: boolean;
    dateFilter: string;
    onDateFilterChange: (date: string) => void;
    iconFilter: string;
    onIconFilterChange: (icon: string) => void;
    availableIcons: string[];
}

export const TravelHeader: React.FC<TravelHeaderProps> = ({
    searchQuery,
    onSearchChange,
    onImport,
    onExport,
    onRemoveAll,
    isImporting,
    hasPlaces,
    dateFilter,
    onDateFilterChange,
    iconFilter,
    onIconFilterChange,
    availableIcons,
}) => {
    return (
        <header className="mf-travel-header flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b bg-card z-10 gap-4">
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

                    <MoreFilters
                        dateFilter={dateFilter}
                        onDateFilterChange={onDateFilterChange}
                        iconFilter={iconFilter}
                        onIconFilterChange={onIconFilterChange}
                        availableIcons={availableIcons}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <TravelActions
                        onImport={onImport}
                        onExport={onExport}
                        onRemoveAll={onRemoveAll}
                        isImporting={isImporting}
                        hasPlaces={hasPlaces}
                    />
                </div>
            </div>
        </header>
    );
};
