import { CSSProperties } from 'react';
import { safeUrl } from '../inline-text';
import { TripHero } from '../types';

const heroImageStyle = (image: string | undefined): CSSProperties | undefined => {
    const url = safeUrl(image);
    return url ? ({ '--hero-image': `url("${url}")` } as CSSProperties) : undefined;
};

export const TripHeroBanner = ({ hero }: { hero: TripHero }) => (
    <header className="mf-trip-hero-banner trip-hero" style={heroImageStyle(hero.image)}>
        <div className="trip-hero-inner">
            {hero.eyebrow && <div className="trip-eyebrow">{hero.eyebrow}</div>}
            <h1>
                {hero.title.split('\n').map((line, i) => (
                    <span key={i}>
                        {i > 0 && <br />}
                        {line}
                    </span>
                ))}
            </h1>
            {hero.subtitle && <p>{hero.subtitle}</p>}
            {hero.pills && hero.pills.length > 0 && (
                <div className="trip-pills">
                    {hero.pills.map((pill, i) => (
                        <span key={i} className="trip-pill">
                            {pill}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </header>
);
