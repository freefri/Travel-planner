export interface TextFragment {
    text: string;
    bold: boolean;
}

// Trip data arrives from a shared link, so only web links are allowed: anything else
// (javascript:, data:) would run or render attacker-chosen content.
export const safeUrl = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
    } catch {
        return undefined;
    }
};

export const splitBold = (value: string): TextFragment[] =>
    value
        .split(/\*\*(.+?)\*\*/)
        .map((text, i) => ({ text, bold: i % 2 === 1 }))
        .filter((fragment) => fragment.text !== '');
