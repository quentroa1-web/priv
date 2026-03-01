import { lazy, ComponentType } from 'react';

/**
 * A wrapper around React.lazy that handles chunk loading errors byproduct of new deployments.
 * When a chunk fails to load, it typically means the app has been updated and the old chunk
 * is no longer available. This function catches the error and reloads the page to get the latest version.
 */
export function lazyRetry<T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T } | T>
) {
    return lazy(async () => {
        try {
            const component = await componentImport();
            // Handle both { default: T } (standard ES module) and T (direct export)
            if ('default' in component) {
                return { default: component.default };
            }
            return { default: component };
        } catch (error) {
            console.error('Lazy loading failed:', error);

            // Check if we've already tried to reload to avoid infinite loops
            const hasReloaded = window.sessionStorage.getItem('lazy-retry-reloaded');

            // Typical error messages for chunk failures
            const errorString = error?.toString() || '';
            const isChunkError =
                /loading chunk/i.test(errorString) ||
                /Failed to fetch dynamically imported module/i.test(errorString) ||
                /Unexpected token '<'/i.test(errorString) ||
                /MIME type/i.test(errorString);

            if (isChunkError && !hasReloaded) {
                window.sessionStorage.setItem('lazy-retry-reloaded', 'true');
                window.location.reload();
                return { default: (() => null) as unknown as T };
            }

            // If it's not a chunk error or we already reloaded, throw it so ErrorBoundary can catch it
            throw error;
        }
    });
}

/**
 * A wrapper around dynamic import() that handles chunk loading errors byproduct of new deployments.
 */
export async function importRetry<T>(importFn: () => Promise<T>): Promise<T> {
    try {
        return await importFn();
    } catch (error) {
        console.error('Dynamic import failed:', error);

        const hasReloaded = window.sessionStorage.getItem('import-retry-reloaded');
        const errorString = error?.toString() || '';
        const isChunkError =
            /loading chunk/i.test(errorString) ||
            /Failed to fetch dynamically imported module/i.test(errorString) ||
            /Unexpected token '<'/i.test(errorString) ||
            /MIME type/i.test(errorString);

        if (isChunkError && !hasReloaded) {
            window.sessionStorage.setItem('import-retry-reloaded', 'true');
            window.location.reload();
            // Return a promise that never resolves as the page is reloading
            return new Promise(() => { });
        }

        throw error;
    }
}
