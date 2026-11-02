import { ChecklistBlock } from '../types';
import { InlineText } from './InlineText';

export const TripChecklist = ({ block }: { block: ChecklistBlock }) => (
    <div className="mf-trip-checklist trip-checklist">
        {block.items.map((item, i) => (
            <div key={i} className="trip-check">
                <b>{item.title}</b>
                {item.text && (
                    <span>
                        <InlineText text={item.text} />
                    </span>
                )}
            </div>
        ))}
    </div>
);
