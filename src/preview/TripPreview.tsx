import { TripMessage } from './components/TripMessage';
import { TripPage } from './components/TripPage';
import { useStaticGuide } from './use-static-guide';
import { useTripFromHash } from './use-trip-from-hash';

export const TripPreview = () => {
    const state = useTripFromHash();
    useStaticGuide(state.status === 'empty');
    switch (state.status) {
        case 'empty':
            return null;
        case 'error':
            return (
                <TripMessage
                    title="No se ha podido leer el viaje"
                    text="El enlace está incompleto o dañado. Pide que te lo vuelvan a enviar."
                    detail={state.detail}
                />
            );
        case 'ready':
            return <TripPage trip={state.trip} />;
    }
};
