import { splitBold } from '../inline-text';

export const InlineText = ({ text }: { text: string }) => (
    <>
        {splitBold(text).map((fragment, i) => (fragment.bold ? <b key={i}>{fragment.text}</b> : fragment.text))}
    </>
);
