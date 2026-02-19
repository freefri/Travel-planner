import React from 'react';

interface DateTimeSelectorProps {
    timestamp?: string;
    onChange: (datePart?: string, timePart?: string) => void;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ timestamp, onChange }) => {
    // Helpers to format ISO for inputs
    const formatDateForInput = (iso?: string) => {
        if (!iso) return '';
        const date = new Date(iso);
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const formatTimeForInput = (iso?: string) => {
        if (!iso) return '';
        const date = new Date(iso);
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return (
        <div className="flex flex-col gap-2 ml-7 max-w-[calc(100%-28px)]">
            <input
                type="date"
                className="w-full bg-white border rounded p-1 text-xs"
                value={formatDateForInput(timestamp)}
                onChange={e => onChange(e.target.value, undefined)}
            />
            <input
                type="time"
                step="60"
                className="w-full bg-white border rounded p-1 text-xs"
                value={formatTimeForInput(timestamp)}
                onChange={e => onChange(undefined, e.target.value)}
            />
        </div>
    );
};
