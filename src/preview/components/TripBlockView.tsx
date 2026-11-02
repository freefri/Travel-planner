import { TripBlock, TripLabels } from '../types';
import { InlineText } from './InlineText';
import { StopCard } from './StopCard';
import { TransportTable } from './TransportTable';
import { TripCallout } from './TripCallout';
import { TripCards } from './TripCards';
import { TripChecklist } from './TripChecklist';

interface TripBlockViewProps {
    block: TripBlock;
    labels: TripLabels;
}

export const TripBlockView = ({ block, labels }: TripBlockViewProps) => {
    switch (block.type) {
        case 'transport':
            return <TransportTable block={block} labels={labels} />;
        case 'stop':
            return <StopCard block={block} />;
        case 'callout':
            return <TripCallout block={block} />;
        case 'cards':
            return <TripCards block={block} />;
        case 'checklist':
            return <TripChecklist block={block} />;
        case 'note':
            return (
                <p className="mf-trip-note trip-smallprint">
                    <InlineText text={block.text} />
                </p>
            );
    }
};
