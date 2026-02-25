import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'profile' | 'article';
    jsonLd?: object;
}

export function SEO({
    title = 'SafeConnect - Escorts y Clasificados Verificados en Colombia',
    description = 'Descubre los mejores anuncios de escorts, modelos independientes y acompañantes verificados en Colombia. Privacidad, seguridad y calidad garantizada 24/7.',
    keywords = 'escorts colombia, acompañantes bogota, mileroticos colombia, modelos independientes medellin, servicios adultos masajes, masajistas verificadas cali',
    image = '/og-image.jpg',
    url = window.location.origin,
    type = 'website',
    jsonLd
}: SEOProps) {
    useEffect(() => {
        // Update Title
        document.title = title;

        // Update Meta Tags
        const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        updateMeta('description', description);
        updateMeta('keywords', keywords);

        // Open Graph
        updateMeta('og:title', title, 'property');
        updateMeta('og:description', description, 'property');
        updateMeta('og:image', image, 'property');
        updateMeta('og:url', url, 'property');
        updateMeta('og:type', type, 'property');

        // Twitter
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', image);

        // JSON-LD
        const existingScript = document.getElementById('json-ld');
        if (existingScript) {
            existingScript.remove();
        }

        if (jsonLd) {
            const script = document.createElement('script');
            script.id = 'json-ld';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(jsonLd);
            document.head.appendChild(script);
        }
    }, [title, description, keywords, image, url, type, jsonLd]);

    return null;
}
