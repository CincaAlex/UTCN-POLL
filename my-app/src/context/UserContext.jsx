import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

// Generate mock user
const generateMockUserData = (role) => {
    const isAdmin = role === 'admin';

    return {
        username: isAdmin ? 'Secretariat AC' : 'HighRoller_777',
        name: isAdmin ? 'Secretariat AC' : 'HighRoller_777',
        role,
        photoUrl: isAdmin
            ? 'https://i.pravatar.cc/150?u=secretariat'
            : 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR',
        tokens: 1450230,
        friends: 100,

        votedPolls: [], // 🔥 NEW

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

// Load user from storage
const loadInitialUserDataAndSetState = async (setUser, setLoading) => {
    setLoading(true);
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.role = parsedUser.role || 'user';
        parsedUser.votedPolls = parsedUser.votedPolls || [];

        setUser(parsedUser);
    } else {
        setUser(null);
    }

    setLoading(false);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (role = 'user') => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newUser = generateMockUserData(role);
                setUser(newUser);
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                resolve(newUser);
            }, 1000);
        });
    };

    const updateUser = (newData) => {
        setUser(newData);
        localStorage.setItem('currentUser', JSON.stringify(newData));
    };

    const addPollBet = ({ pollId, optionIds, betAmount }) => {
        if (!user) return;

        // Prevent double voting
        const alreadyVoted = user.votedPolls.some(p => p.pollId === pollId);
        if (alreadyVoted) return;

        if (user.tokens < betAmount) {
            throw new Error('Not enough tokens');
        }

        const updatedUser = {
            ...user,
            tokens: user.tokens - betAmount,
            votedPolls: [
                ...user.votedPolls,
                {
                    pollId,
                    optionIds,
                    betAmount,
                    votedAt: new Date().toISOString()
                }
            ]
        };

        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        setLoading(false);
    };

    useEffect(() => {
        loadInitialUserDataAndSetState(setUser, setLoading);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
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
