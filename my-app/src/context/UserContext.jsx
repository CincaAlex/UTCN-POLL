import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

// Function to generate consistent simulated user data
const generateMockUserData = (role) => {
    const isAdmin = role === 'admin';
    return {
        // NOTE: Ensure this username matches the mock data used in Homepage.jsx for testing deletion!
        username: isAdmin ? 'Secretariat AC' : 'HighRoller_777', 
        name: isAdmin ? 'Secretariat AC' : 'HighRoller_777',
        role: role,
        photoUrl: isAdmin ? 'https://i.pravatar.cc/150?u=secretariat' : 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR',
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
    };
};

// Function to check localStorage and set initial state
const loadInitialUserDataAndSetState = async (setUser, setLoading) => {
    setLoading(true);
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
        let parsedUser = JSON.parse(storedUser);
        
        parsedUser.role = parsedUser.role || 'user'; 

        if (!parsedUser.photoUrl) {
           parsedUser.photoUrl = 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR';
           localStorage.setItem('currentUser', JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
        setLoading(false);
    } else {
        // No user in storage, set initial unauthenticated state
        setUser(null);
        setLoading(false);
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (role = 'user') => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newUserData = generateMockUserData(role);
                setUser(newUserData);
                localStorage.setItem('currentUser', JSON.stringify(newUserData));
                resolve(newUserData);
            }, 1000); // Simulate login latency
        });
    };

    const updateUser = (newData) => {
        setUser(newData);
        localStorage.setItem('currentUser', JSON.stringify(newData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        setLoading(false);
    };

    useEffect(() => {
        // Fix for react-hooks/exhaustive-deps warning
        loadInitialUserDataAndSetState(setUser, setLoading);
    }, []); 

    return (
        <UserContext.Provider value={{ user, updateUser, loading, logout, login }}>
            {children}
        </UserContext.Provider>
    );
};