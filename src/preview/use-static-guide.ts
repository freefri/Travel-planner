import { useEffect } from 'react';

// The guide is part of the page template so that clients without JavaScript can read it.
export const useStaticGuide = (visible: boolean) => {
    useEffect(() => {
        const guide = document.getElementById('trip-guide');
        if (guide) guide.hidden = !visible;
    }, [visible]);
};
