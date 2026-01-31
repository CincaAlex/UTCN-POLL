import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchFullUserByEmail = async (email, token) => {
        
        try {
            const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });


            if (!res.ok) {
                const errorText = await res.text();
                console.error('[UserContext] Error response:', errorText);
                throw new Error(`Failed to fetch user by email: ${res.status}`);
            }

            const userData = await res.json();
            return userData;
        } catch (error) {
            console.error('[UserContext] Fetch error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const initFromToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    logout();
                    return;
                }

                const email = decodedToken.sub;
                
                const fullUser = await fetchFullUserByEmail(email, token);
                setUser(fullUser);

            } catch (e) {
                console.error("[UserContext] Token init error:", e);
                try {
                    const decodedToken = jwtDecode(token);
                    const fallbackUser = { 
                        email: decodedToken.sub, 
                        name: decodedToken.sub, 
                        userType: 'USER' 
                    };
                    setUser(fallbackUser);
                } catch (decodeError) {
                    console.error("[UserContext] Failed to create fallback user:", decodeError);
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initFromToken();
    }, [token]);

    const login = async (minimalUser, token) => {
        
        localStorage.setItem("token", token);
        setToken(token);

        try {
            const email = minimalUser?.email;
            if (!email) throw new Error("Missing email in login()");

            const fullUser = await fetchFullUserByEmail(email, token);

            setUser(fullUser);
        } catch (e) {
            console.error("[UserContext] Could not fetch full user. Keeping minimal user.", e);
            setUser(minimalUser);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const updateUser = (newData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newData };
            return updatedUser;
        });
    };
    
    const addPollBet = ({ pollId, optionIds, betAmount }) => {
    };

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                updateUser,
                addPollBet
            }}
        >
            {children}
        </UserContext.Provider>
    );
};