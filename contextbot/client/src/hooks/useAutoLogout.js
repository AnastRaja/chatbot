import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeoutMs = 30 * 60 * 1000) => { // Default: 30 minutes
    const { logout, isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (isAuthenticated) {
            timerRef.current = setTimeout(() => {
                logout();
                navigate('/login');
            }, timeoutMs);
        }
    }, [isAuthenticated, logout, navigate, timeoutMs]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        // Initial setup
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated, resetTimer]);

    return;
};

export default useAutoLogout;
