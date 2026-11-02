import { safeUrl } from '../inline-text';
import { TripPhoto } from '../types';

const PhotoCaption = ({ photo }: { photo: TripPhoto }) =>
    photo.title || photo.caption ? (
        <span>
            {photo.title}
            {photo.caption && <small>{photo.caption}</small>}
        </span>
    ) : null;

const StopPhoto = ({ photo, src }: { photo: TripPhoto; src: string }) => {
    const image = <img loading="lazy" src={src} alt={photo.alt ?? photo.title ?? ''} />;
    const href = safeUrl(photo.href);
    return href ? (
        <a className="trip-stop-photo e2e-stop-photo" href={href} target="_blank" rel="noopener noreferrer">
            {image}
            <PhotoCaption photo={photo} />
        </a>
    ) : (
        <div className="trip-stop-photo e2e-stop-photo">
            {image}
            <PhotoCaption photo={photo} />
        </div>
    );
};

export const StopPhotos = ({ photos }: { photos?: TripPhoto[] }) => {
    const shown = (photos ?? []).flatMap((photo) => {
        const src = safeUrl(photo.src);
        return src ? [{ photo, src }] : [];
    });
    if (shown.length === 0) return null;
    return (
        <div className="mf-stop-photos trip-stop-photos">
            {shown.map(({ photo, src }, i) => (
                <StopPhoto key={i} photo={photo} src={src} />
            ))}
        </div>
    );
};
