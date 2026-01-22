import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchFullUserByEmail = async (email, token) => {
        console.log('🔍 [UserContext] Fetching user by email:', email);
        
        try {
            const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('🔍 [UserContext] Response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('🔍 [UserContext] Error response:', errorText);
                throw new Error(`Failed to fetch user by email: ${res.status}`);
            }

            const userData = await res.json();
            console.log('🔍 [UserContext] User data received:', userData);
            console.log('🔍 [UserContext] User tokens:', userData.tokens);
            return userData;
        } catch (error) {
            console.error('🔍 [UserContext] Fetch error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const initFromToken = async () => {
            if (!token) {
                console.log('🔍 [UserContext] No token found');
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                console.log('🔍 [UserContext] Decoded token:', decodedToken);

                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log('🔍 [UserContext] Token expired');
                    logout();
                    return;
                }

                // ✅ Fetch user complet din DB
                const email = decodedToken.sub;
                console.log('🔍 [UserContext] Fetching full user for:', email);
                
                const fullUser = await fetchFullUserByEmail(email, token);
                console.log('🔍 [UserContext] Setting user:', fullUser);
                setUser(fullUser);

            } catch (e) {
                console.error("🔍 [UserContext] Token init error:", e);
                // Dacă fetch-ul eșuează, păstrăm un user minim
                try {
                    const decodedToken = jwtDecode(token);
                    const fallbackUser = { 
                        email: decodedToken.sub, 
                        name: decodedToken.sub, 
                        userType: 'USER' 
                    };
                    console.log('🔍 [UserContext] Using fallback user:', fallbackUser);
                    setUser(fallbackUser);
                } catch (decodeError) {
                    console.error("🔍 [UserContext] Failed to create fallback user:", decodeError);
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initFromToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (minimalUser, token) => {
        console.log('🔍 [UserContext] Login called with:', minimalUser);
        
        // 1) salvează token
        localStorage.setItem("token", token);
        setToken(token);

        // 2) fetch user complet din DB
        try {
            const email = minimalUser?.email;
            if (!email) throw new Error("Missing email in login()");

            const fullUser = await fetchFullUserByEmail(email, token);

            console.log('🔍 [UserContext] Login successful, user:', fullUser);
            setUser(fullUser);
        } catch (e) {
            console.error("🔍 [UserContext] Could not fetch full user. Keeping minimal user.", e);
            setUser(minimalUser); // fallback ca să nu crape UI-ul
        }
    };

    const logout = () => {
        console.log('🔍 [UserContext] Logging out');
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const updateUser = (newData) => {
        console.log('👤 [UserContext] Updating user with:', newData);
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newData };
            console.log('👤 [UserContext] New user state:', updatedUser);
            return updatedUser;
        });
    };
    
    const addPollBet = ({ pollId, optionIds, betAmount }) => {
        console.log("Voting feature needs to be connected to the backend.", { pollId, optionIds, betAmount });
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