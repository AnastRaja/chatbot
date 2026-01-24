import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('contextbot_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const fetchProfiles = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await axios.get('/api/profiles');
            setProfiles(res.data);
        } catch (error) {
            console.error('Failed to fetch profiles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfiles();
        }
    }, [isAuthenticated]);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('contextbot_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setProfiles({});
        localStorage.removeItem('contextbot_user');
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
            login,
            logout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
