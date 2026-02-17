import { createRoot } from 'react-dom/client';
import { Travel } from './Travel';
import './styles/global.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Travel />);
}
