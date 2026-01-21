import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

const fetchFullUserByEmail = async (email, token) => {
  const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch full user: ${res.status}`);
  return await res.json();
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

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

            // ✅ FETCH USER COMPLET DIN DB
            const email = decodedToken.sub;
            const fullUser = await fetchFullUserByEmail(email, token);
            setUser(fullUser);

        } catch (e) {
            console.error("Token decode error:", e);
            // Dacă fetch-ul eșuează, păstrăm un user minim
            const decodedToken = jwtDecode(token);
            setUser({ email: decodedToken.sub, name: decodedToken.sub, userType: 'USER' });
        } finally {
            setLoading(false);
        }
    };

    initFromToken();
}, [token]);


    const fetchFullUserByEmail = async (email, token) => {
    const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch user by email: ${res.status}`);
    }

    return await res.json();
    };


    const login = async (minimalUser, token) => {
    // 1) salvează token
    localStorage.setItem("token", token);
    setToken(token);

    // 2) fetch user complet din DB
    try {
        const email = minimalUser?.email;
        if (!email) throw new Error("Missing email in login()");

        const fullUser = await fetchFullUserByEmail(email, token);

        // IMPORTANT: acum user are id, points, etc.
        setUser(fullUser);
    } catch (e) {
        console.error("Could not fetch full user. Keeping minimal user.", e);
        setUser(minimalUser); // fallback ca să nu crape UI-ul
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
            // Note: This only updates the context state.
            // To persist changes, you would typically make an API call here
            // and then update the state with the response.
            return updatedUser;
        });
    };
    
    // The addPollBet function needs to be re-evaluated as it was based on mock data.
    // For now, it will be a placeholder.
    const addPollBet = ({ pollId, optionIds, betAmount }) => {
        console.log("Voting feature needs to be connected to the backend.", { pollId, optionIds, betAmount });
        // This would involve making an API call to the backend,
        // and then updating the user's token/points state upon success.
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