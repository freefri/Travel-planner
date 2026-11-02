import { CalloutBlock } from '../types';
import { InlineText } from './InlineText';

export const TripCallout = ({ block }: { block: CalloutBlock }) => (
    <div className="mf-trip-callout trip-callout">
        {block.title && <strong>{block.title}</strong>}
        <InlineText text={block.text} />
    </div>
);
