import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Function to simulate fetching/loading initial user data
    const loadInitialUserData = async () => {
        setLoading(true);
        // 1. Try to load user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            let parsedUser = JSON.parse(storedUser);
            // ... (rest of your photoUrl check logic)
            if (!parsedUser.photoUrl) {
               parsedUser.photoUrl = 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR';
               localStorage.setItem('currentUser', JSON.stringify(parsedUser));
            }
            setUser(parsedUser);
            setLoading(false);
        } else {
            // 2. If not in localStorage, simulate initial fetch (the "login" data)
            const fetchedData = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        username: 'Secretariat AC', // Changed to match one of the poll authors
                        name: 'Secretariat AC', // Added name field
                        role: 'admin', 
                        photoUrl: 'https://i.pravatar.cc/150?u=secretariat', // Changed avatar
                        tokens: 1450230,
                        friends: 100,
                        pollHistory: [
                            { month: 'Jan', winnings: 4000 },
                            { month: 'Feb', winnings: 3000 },
                            { month: 'Mar', winnings: 5500 },
                            { month: 'Apr', winnings: 4800 },
                            { month: 'May', winnings: 9000 },
                            { month: 'Jun', winnings: 12500 },
                        ],
                        badges: [
                            { name: 'High Roller', symbol: '💎', className: 'badge-gold' },
                            { name: 'On Fire', symbol: '🔥', className: 'badge-red' },
                            { name: 'Poker Shark', symbol: '🦈', className: 'badge-blue' },
                        ]
                    });
                }, 1000);
            });
            setUser(fetchedData);
            localStorage.setItem('currentUser', JSON.stringify(fetchedData)); // Save initial fetched data
            setLoading(false);
        }
    };
    
    // *** NEW LOGIN FUNCTION ***
    const login = () => {
        return loadInitialUserData(); // Simply re-run the fetching logic
    };

    // Existing useEffect logic
    useEffect(() => {
        loadInitialUserData();
    }, []);

    const updateUser = (newData) => {
        setUser(newData);
        localStorage.setItem('currentUser', JSON.stringify(newData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        setLoading(false);
    };

    return (
        // *** EXPOSE LOGIN IN THE VALUE PROP ***
        <UserContext.Provider value={{ user, updateUser, loading, logout, login }}>
            {children}
        </UserContext.Provider>
    );
};