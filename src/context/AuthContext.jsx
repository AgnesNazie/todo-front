import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initializeWindowEvents, removeWindowEvents } from '../utils/windowEvents';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const initializeAuth = () => {
            const currentUser = authService.getCurrentUser();
            const currentToken = authService.getToken();

            setUser(currentUser);
            setToken(currentToken);
            setIsLoading(false);
        };

        initializeAuth();

        // Initialize window events only if there's a token
        let cleanup;
        if (token) {
            cleanup = initializeWindowEvents(() => {
                // Don't need to do anything here, handleUnload will handle the logout
                setUser(null);
                setToken(null);
            });
        }

        return () => {
            if (cleanup) {
                cleanup();
            }
            removeWindowEvents();
        };
    }, [token]);




    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            setUser(response);
            setToken(response.token);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const hasRole = (role) => {
        return authService.hasRole(user, role);
    };

    const isAdmin = () => {
        return authService.isAdmin(user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                login,
                logout,
                hasRole,
                isAdmin
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};