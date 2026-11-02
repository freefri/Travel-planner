import { describe, it, expect } from 'vitest';
import { safeUrl, splitBold } from './inline-text';

describe('safeUrl', () => {
    it('keeps http and https links', () => {
        expect(safeUrl('https://example.com/a b.jpg')).toBe('https://example.com/a%20b.jpg');
        expect(safeUrl('http://example.com/')).toBe('http://example.com/');
    });

    it('drops scripts, data and relative links', () => {
        expect(safeUrl('javascript:alert(1)')).toBeUndefined();
        expect(safeUrl('data:text/html,<b>x</b>')).toBeUndefined();
        expect(safeUrl('/relative.jpg')).toBeUndefined();
        expect(safeUrl(undefined)).toBeUndefined();
    });

    it('percent-encodes quotes so the URL can sit inside CSS url("...")', () => {
        expect(safeUrl('https://example.com/a"b.jpg')).not.toContain('"');
    });
});

describe('splitBold', () => {
    it('splits **marked** fragments', () => {
        expect(splitBold('**90€** 1 escala SAW')).toEqual([
            { text: '90€', bold: true },
            { text: ' 1 escala SAW', bold: false },
        ]);
    });

    it('leaves text without markers untouched', () => {
        expect(splitBold('Transfer o taxi')).toEqual([{ text: 'Transfer o taxi', bold: false }]);
    });

    it('keeps an unmatched marker as literal text', () => {
        expect(splitBold('2 ** 3')).toEqual([{ text: '2 ** 3', bold: false }]);
    });
});
