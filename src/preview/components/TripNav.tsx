import { MouseEvent } from 'react';
import { TripSection } from '../types';

// The URL hash carries the trip itself, so following a plain #anchor would wipe the data.
const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const TripNav = ({ sections }: { sections: TripSection[] }) => (
    <nav className="mf-trip-nav trip-nav">
        {sections.map((section) => (
            <a
                key={section.id}
                href={`#${section.id}`}
                className="e2e-trip-nav-link"
                onClick={(event) => scrollToSection(event, section.id)}
            >
                {section.navLabel ?? section.title}
            </a>
        ))}
    </nav>
);
