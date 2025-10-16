/**
 * @file DynamicMetadata.tsx
 * @summary A component that dynamically updates the document's head metadata.
 */
import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const DynamicMetadata = () => {
    const { settings } = useSiteSettings();

    useEffect(() => {
        if (settings) {
            const { siteTitle, siteDescription, logoUrl } = settings;

            if (siteTitle) {
                document.title = siteTitle;
                document.querySelector('meta[property="og:title"]')?.setAttribute('content', siteTitle);
            }

            if (siteDescription) {
                document.querySelector('meta[name="description"]')?.setAttribute('content', siteDescription);
                document.querySelector('meta[property="og:description"]')?.setAttribute('content', siteDescription);
            }

            if (logoUrl) {
                document.querySelector('link[rel="icon"]')?.setAttribute('href', logoUrl);
                document.querySelector('meta[property="og:image"]')?.setAttribute('content', logoUrl);
            }
        }
    }, [settings]);

    return null; // This component does not render anything to the DOM
};

export default DynamicMetadata;
