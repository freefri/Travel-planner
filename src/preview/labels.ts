import { TripLabels } from './types';

export const DEFAULT_LABELS: TripLabels = {
    transportRoute: 'Trayecto',
    transportDuration: 'Tiempo estimado',
    transportNote: 'Modo recomendado / nota',
};

export const resolveLabels = (overrides: Partial<TripLabels> = {}): TripLabels => ({
    ...DEFAULT_LABELS,
    ...overrides,
});
