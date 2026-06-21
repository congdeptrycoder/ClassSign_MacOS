import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCurrentAccount, getCurrentAccount } from '../../../shared/session/currentUserSession';


interface UseAppMenuOptions {
    onShowAbout: () => void;
}

/**
 * useAppMenuViewModel
 *
 * ViewModel responsible for bridging the native Electron application menu with
 * the React renderer.  Follows the Observer pattern: it subscribes to IPC events
 * emitted by the main process (via the preload bridge) and reacts accordingly.
 *
 * Responsibilities:
 * - Notify main process of the current login state whenever it changes.
 * - Handle the "Log Out" menu action by clearing the session and navigating to /login.
 * - Forward the "Show About" menu action to the provided callback so the calling
 *   component can render the AboutModal.
 */
export function useAppMenuViewModel({ onShowAbout }: UseAppMenuOptions) {
    const navigate = useNavigate();

    // Inform main process of login state on mount and whenever the account changes.
    useEffect(() => {
        const account = getCurrentAccount();
        const loggedIn = account !== null;

        try {
            window.api?.setLoggedIn(loggedIn);
        } catch (err) {
            // Running outside Electron (e.g. browser dev server) – silently ignore.
            console.warn('[useAppMenuViewModel] api.setLoggedIn not available', err);
        }
    });

    // Subscribe to native menu "Log Out" event.
    useEffect(() => {
        let cleanup: (() => void) | undefined;
        try {
            cleanup = window.api?.onMenuLogout(() => {
                clearCurrentAccount();
                // Notify main process login state is now false
                window.api?.setLoggedIn(false);
                navigate('/login', { replace: true });
            });
        } catch (err) {
            console.warn('[useAppMenuViewModel] onMenuLogout not available', err);
        }
        return () => cleanup?.();
    }, [navigate]);

    // Subscribe to native menu "Show About" event.
    useEffect(() => {
        let cleanup: (() => void) | undefined;
        try {
            cleanup = window.api?.onMenuShowAbout(() => {
                onShowAbout();
            });
        } catch (err) {
            console.warn('[useAppMenuViewModel] onMenuShowAbout not available', err);
        }
        return () => cleanup?.();
    }, [onShowAbout]);
}
