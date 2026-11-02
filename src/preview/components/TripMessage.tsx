interface TripMessageProps {
    title: string;
    text: string;
    detail?: string;
}

export const TripMessage = ({ title, text, detail }: TripMessageProps) => (
    <div className="mf-trip-message trip-message">
        <h1 className="trip-section-title">{title}</h1>
        <p>{text}</p>
        {detail && <code className="e2e-trip-error-detail">{detail}</code>}
    </div>
);
