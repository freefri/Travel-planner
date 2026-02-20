import React, { useState, useRef, useEffect } from 'react';
import { Menu, Import, Download, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TravelActionsProps {
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onRemoveAll: () => void;
    isImporting: boolean;
    hasPlaces: boolean;
}

export const TravelActions: React.FC<TravelActionsProps> = ({
    onImport,
    onExport,
    onRemoveAll,
    isImporting,
    hasPlaces,
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

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border-2"
                aria-label="Actions Menu"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1 bg-white">
                        <label className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg cursor-pointer transition-colors">
                            <input
                                type="file"
                                accept=".kmz,.kml"
                                className="hidden"
                                onChange={(e) => {
                                    onImport(e);
                                    setIsOpen(false);
                                }}
                                disabled={isImporting}
                            />
                            <Import className={cn("w-4 h-4 text-primary", isImporting && "animate-pulse")} />
                            <span>{isImporting ? 'Importing...' : 'Import KMZ/KML'}</span>
                        </label>

                        <button
                            onClick={() => handleAction(onExport)}
                            disabled={!hasPlaces}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4 text-primary" />
                            <span>Export KMZ</span>
                        </button>

                        <div className="h-px bg-border my-1" />

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to remove ALL places? This action cannot be undone.')) {
                                    handleAction(onRemoveAll);
                                }
                            }}
                            disabled={!hasPlaces}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove All Places</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
