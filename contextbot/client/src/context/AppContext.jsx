import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fetch user profiles (if needed for the app)
    const fetchProfiles = async () => {
        if (!user) return;
        try {
            // Adjust this endpoint as needed for your app
            // This assumes your backend has a route to get profiles for the current user
            const res = await axios.get(`/api/profiles`);
            setProfiles(res.data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    const register = async (email, password, name) => {
        // Use custom backend registration
        const res = await axios.post('/api/auth/register', { email, password, name });
        return res.data;
    };

    const login = async (email, password) => {
        // Use custom backend login
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.success) {
            const { token, user } = res.data;
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Normalize user object to match Firebase structure
            const normalizedUser = {
                ...user,
                emailVerified: user.isVerified // Map MongoDB field to Firebase-like field
            };
            setUser(normalizedUser);
            setIsAuthenticated(true);
            return normalizedUser;
        }
    };

    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // Sync with backend to create user in DB
            const token = await result.user.getIdToken();
            const res = await axios.post('/api/auth/google-sync', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // onAuthStateChanged will handle the state update
            return result.user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        // Clear both custom and firebase
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        try {
            await signOut(auth);
        } catch (e) {
            console.log("Firebase signout error (might not be logged in to firebase):", e);
        }
        setUser(null);
        setIsAuthenticated(false);
        setProfiles(null);
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            return res.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to send reset email';
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const res = await axios.post('/api/auth/reset-password', { token, newPassword });
            return res.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to reset password';
        }
    };

    // Auto-Logout Service
    useEffect(() => {
        const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour

        const updateActivity = () => {
            if (user) {
                const now = Date.now();
                const last = Number(localStorage.getItem('lastActivity') || 0);
                if (now - last > 30 * 1000) {
                    localStorage.setItem('lastActivity', now.toString());
                }
            }
        };

        const checkInactivity = () => {
            const lastActivity = Number(localStorage.getItem('lastActivity'));
            if (lastActivity && (Date.now() - lastActivity > INACTIVITY_LIMIT) && user) {
                console.log('User inactive for >1 hour. Logging out...');
                logout();
            }
        };

        const intervalId = setInterval(checkInactivity, 60 * 1000);

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);

        if (user) {
            const current = localStorage.getItem('lastActivity');
            if (!current) {
                localStorage.setItem('lastActivity', Date.now().toString());
            }
        }

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [user]);

    // Initial Load Logic
    useEffect(() => {
        const initAuth = async () => {
            const customToken = localStorage.getItem('authToken');

            // 1. Check for Custom Token (Email/Pass users)
            if (customToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${customToken}`;
                try {
                    // Ideally, verify token with backend here or decode it
                    // For now, we'll try to decode the payload to get user info optimistically
                    const base64Url = customToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);

                    // Check expiration
                    if (Date.now() >= payload.exp * 1000) {
                        throw new Error("Token expired");
                    }

                    setUser({
                        uid: payload.uid,
                        email: payload.email,
                        provider: payload.provider,
                        emailVerified: true // Implicit
                    });
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error("Invalid or expired custom token", e);
                    logout();
                }
            }

            // 2. Listen for Firebase Auth changes (Google users)
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    // If we already have a custom user logged in, we might want to prioritize that
                    // OR if this is a fresh load and we found a firebase user

                    // Google users are verified by definition
                    const token = await firebaseUser.getIdToken();
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        provider: 'google', // or 'firebase'
                        emailVerified: true
                    });
                    setIsAuthenticated(true);
                } else {
                    // If no firebase user AND we didn't find a valid custom token earlier
                    if (!customToken) {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
                setLoading(false);
            });

            return () => unsubscribe();
        };

        initAuth();
    }, []);

    // Fetch data when user is authenticated
    useEffect(() => {
        if (user) {
            fetchProfiles();
        } else {
            setProfiles(null);
        }
    }, [user]);

    return (
        <AppContext.Provider value={{
            user,
            profiles,
            setProfiles,
            fetchProfiles,
            loading,
            setLoading,
            isAuthenticated,
            register,
            login,
            googleLogin,
            logout,
            forgotPassword,
            resetPassword
        }}>
            {!loading && children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
