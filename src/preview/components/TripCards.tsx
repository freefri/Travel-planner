import { CardsBlock } from '../types';
import { BulletList } from './BulletList';
import { InlineText } from './InlineText';

export const TripCards = ({ block }: { block: CardsBlock }) => (
    <div className="mf-trip-cards trip-two-col">
        {block.cards.map((card, i) => (
            <div key={i} className="trip-card">
                <h3>{card.title}</h3>
                {card.text && (
                    <p>
                        <InlineText text={card.text} />
                    </p>
                )}
                <BulletList items={card.bullets} />
            </div>
        ))}
    </div>
);
