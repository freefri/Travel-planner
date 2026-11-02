import { StopBlock } from '../types';
import { BulletList } from './BulletList';
import { InlineText } from './InlineText';
import { StopPhotos } from './StopPhotos';

export const StopCard = ({ block }: { block: StopBlock }) => (
    <article className="mf-stop-card trip-stop e2e-stop-card">
        <div className="trip-stop-date">
            {block.dates && <b>{block.dates}</b>}
            {block.summary && <span>{block.summary}</span>}
        </div>
        <div className="trip-stop-body">
            {block.meta && <div className="trip-meta">{block.meta}</div>}
            <h3 id={block.id}>{block.title}</h3>
            {block.text && (
                <p>
                    <InlineText text={block.text} />
                </p>
            )}
            <BulletList items={block.bullets} />
            {block.tags?.map((tag, i) => (
                <span key={i} className="trip-tag">
                    {tag}
                </span>
            ))}
        </div>
        <StopPhotos photos={block.photos} />
    </article>
);
