import { createRoot } from 'react-dom/client';
import { TripPreview } from './TripPreview';
import './trip-preview.css';

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<TripPreview />);
}
