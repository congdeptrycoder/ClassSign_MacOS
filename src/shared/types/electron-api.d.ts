/**
 * Global Window augmentation for the Electron preload bridge.
 *
 * Exposes the `api` object that the preload script injects via contextBridge.
 * Using `?` (optional) ensures the type is safe in non-Electron environments
 * (e.g., when running unit tests in jsdom or a regular browser).
 */

export {}

declare global {
    interface Window {
        api?: {
            /**
             * Notify the main process that the authenticated state has changed.
             * Pass `true` after a successful login, `false` after logout.
             */
            setLoggedIn: (value: boolean) => void;

            /**
             * Subscribe to the native "Log Out" menu item click.
             * Returns a cleanup function to unsubscribe.
             */
            onMenuLogout: (callback: () => void) => () => void;

            /**
             * Subscribe to the native "About" menu item click.
             * Returns a cleanup function to unsubscribe.
             */
            onMenuShowAbout: (callback: () => void) => () => void;
        };
    }
}
