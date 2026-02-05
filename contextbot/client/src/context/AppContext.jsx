import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../firebase';

// Set base URL for production if provided
if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState(null);
    const [loading, setLoading] = useState(true); // Initial load
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Track Firebase Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await syncUser(firebaseUser);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                delete axios.defaults.headers.common['Authorization'];
                setLoading(false);
            }
        });

        // Setup Axios Interceptor to refresh token if needed (optional but good practice)
        // For this scope, the above onAuthStateChanged handles the initial load.
        // Firebase SKD handles token refresh automatically, but we need to ensure we get the fresh one.
        // A simple interceptor to always get the current token before request:
        const interceptorId = axios.interceptors.request.use(async (config) => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => {
            unsubscribe();
            axios.interceptors.request.eject(interceptorId);
        };
    }, []);

    const syncUser = async (firebaseUser = auth.currentUser) => {
        if (!firebaseUser) return;

        try {
            const token = await firebaseUser.getIdToken();
            // Set default header for all axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Sync user with backend
            const res = await axios.post('/api/auth/sync');
            const dbUser = res.data.user;

            // Attach Firebase methods to the DB user object so existing calls work
            if (dbUser) {
                dbUser.getIdToken = async (forceRefresh) => firebaseUser.getIdToken(forceRefresh);
                dbUser.reload = async () => firebaseUser.reload();
                dbUser.emailVerified = firebaseUser.emailVerified; // Ensure this is present for redirects
                dbUser.photoURL = firebaseUser.photoURL;
                setUser(dbUser);
            } else {
                // Fallback but likely won't have subscription data
                setUser(firebaseUser);
            }

            setIsAuthenticated(true);
        } catch (error) {
            console.error("Auth Sync Error", error);
            // Fallback
            setUser(firebaseUser);
            setIsAuthenticated(true);
        } finally {
            setLoading(false);
        }
    };



    const fetchProfiles = async () => {
        if (!user) return;
        // Example of how to attach token if needed manually
        // const token = await user.getIdToken();
        try {
            const res = await axios.get('/api/profiles', {
                // headers: { Authorization: `Bearer ${token}` } 
            });
            // Guard against HTML/String responses (404/500 redirects)
            if (res.data && typeof res.data === 'object') {
                setProfiles(res.data);
            } else {
                console.error('Invalid profiles data received:', res.data);
                setProfiles({});
            }
        } catch (error) {
            console.error('Failed to fetch profiles', error);
        }
    };

    // Auto-fetch profiles when user is set
    useEffect(() => {
        if (user) {
            fetchProfiles();
        } else {
            setProfiles(null);
        }
    }, [user]);

    // --- Auth Wrappers ---

    const register = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user, {
            url: window.location.origin + '/login', // Redirect back to login after verify
        });
        return userCredential.user;
    };

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            // Optional: Sign out immediately if you want to enforce strict "no login until verified"
            // signOut(auth);
            // throw new Error("Please verify your email address.");
            return userCredential.user; // Let component handle the warning
        }
        return userCredential.user;
    };

    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Google users are auto-verified
        return result.user;
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
        setProfiles(null);
    };

    const forgotPassword = async (email) => {
        await sendPasswordResetEmail(auth, email, {
            url: window.location.origin + '/reset-password', // Redirect to app reset page
            handleCodeInApp: true
        });
    };

    const resetPassword = async (oobCode, newPassword) => {
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, newPassword);
    };

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
            resetPassword,
            syncUser
        }}>
            {!loading && children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
