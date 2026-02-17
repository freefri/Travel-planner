import React from 'react';

interface StatsFooterProps {
    totalCount: number;
    visibleCount: number;
    isImporting: boolean;
}

export const StatsFooter: React.FC<StatsFooterProps> = ({ totalCount, visibleCount, isImporting }) => {
    return (
        <footer className="mf-stats-footer px-6 py-2 border-t bg-card text-xs text-muted-foreground flex justify-between items-center">
            <div className="flex gap-4">
                <span>Total Places: <strong>{totalCount}</strong></span>
                <span>Visible: <strong>{visibleCount}</strong></span>
            </div>
            <div>
                {isImporting && <span>Importing data...</span>}
            </div>
        </footer>
    );
};
