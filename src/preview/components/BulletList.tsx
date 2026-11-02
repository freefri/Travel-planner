import { InlineText } from './InlineText';

export const BulletList = ({ items }: { items?: string[] }) =>
    items && items.length > 0 ? (
        <ul className="mf-bullet-list">
            {items.map((item, i) => (
                <li key={i}>
                    <InlineText text={item} />
                </li>
            ))}
        </ul>
    ) : null;
