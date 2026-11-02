import { TransportBlock, TripLabels } from '../types';
import { InlineText } from './InlineText';

interface TransportTableProps {
    block: TransportBlock;
    labels: TripLabels;
}

export const TransportTable = ({ block, labels }: TransportTableProps) => (
    <table className="mf-transport-table trip-transport">
        <thead>
            <tr>
                <th>{labels.transportRoute}</th>
                <th>{labels.transportDuration}</th>
                <th>{labels.transportNote}</th>
            </tr>
        </thead>
        <tbody>
            {block.rows.map((row, i) => (
                <tr key={i}>
                    <td>
                        <InlineText text={row.route} />
                    </td>
                    <td>{row.duration && <InlineText text={row.duration} />}</td>
                    <td>{row.note && <InlineText text={row.note} />}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
