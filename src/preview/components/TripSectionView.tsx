import { TripLabels, TripSection } from '../types';
import { TripBlockView } from './TripBlockView';

interface TripSectionViewProps {
    section: TripSection;
    labels: TripLabels;
}

export const TripSectionView = ({ section, labels }: TripSectionViewProps) => (
    <section id={section.id} className="mf-trip-section-view trip-section">
        <div className="trip-section-head">
            <div>
                {section.eyebrow && <div className="trip-eyebrow trip-eyebrow-accent">{section.eyebrow}</div>}
                <h2 className="trip-section-title">{section.title}</h2>
            </div>
            {section.intro && <p>{section.intro}</p>}
        </div>
        <div className="trip-timeline">
            {section.blocks.map((block, i) => (
                <TripBlockView key={i} block={block} labels={labels} />
            ))}
        </div>
    </section>
);
