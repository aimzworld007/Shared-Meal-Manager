/**
 * @file DynamicMetadata.tsx
 * @summary A component that dynamically updates the document's head metadata.
 */
import React, { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

const DynamicMetadata: React.FC = () => {
  const { config } = useSettings();

  useEffect(() => {
    if (config) {
      // Update document title
      document.title = config.title;

      // Update favicon
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon && config.logoUrl) {
        favicon.href = config.logoUrl;
      }

      // Update OG/Meta tags
      const updateMetaTag = (property: string, content: string) => {
        let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
        if (element) {
          element.content = content;
        } else {
          // If it doesn't exist, create it (less common case for pre-rendered HTML)
          element = document.createElement('meta');
          element.setAttribute('property', property);
          element.content = content;
          document.head.appendChild(element);
        }
      };

      updateMetaTag('og:title', config.title);
      updateMetaTag('og:description', config.description);
      updateMetaTag('og:image', config.logoUrl);
      
      const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (descriptionTag) {
          descriptionTag.content = config.description;
      }
      
    }
  }, [config]);

  return null; // This component doesn't render anything
};

export default DynamicMetadata;
