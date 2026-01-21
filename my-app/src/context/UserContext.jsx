import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        // Token expired
                        logout();
                        return;
                    }

                    // Token is valid, fetch user data
                    // Assuming the email is in the 'sub' field of the token
                    const email = decodedToken.sub;
                    const response = await fetch(`/users/email/${email}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // Failed to fetch user, maybe token is invalid on the server
                        logout();
                    }
                } catch (error) {
                    console.error("Token validation or user fetch error:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = (userData, userToken) => {
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
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