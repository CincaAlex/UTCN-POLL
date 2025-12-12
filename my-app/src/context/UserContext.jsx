import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndLoadFromStorage = async () => {
      // 1. Try to load user from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        let parsedUser = JSON.parse(storedUser);
        // Ensure photoUrl is updated if it was previously null/missing
        if (!parsedUser.photoUrl) {
           parsedUser.photoUrl = 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR';
           localStorage.setItem('currentUser', JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
        setLoading(false);
      } else {
        // 2. If not in localStorage, simulate initial fetch
        const fetchedData = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              username: 'HighRoller_777',
              photoUrl: 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR',
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
        localStorage.setItem('currentUser', JSON.stringify(fetchedData)); // Save initial fetched data to localStorage
        setLoading(false);
      }
    };

    fetchUserDataAndLoadFromStorage();
  }, []);

  const updateUser = (newData) => {
      // Update state
      setUser(newData);
      // Persist to localStorage
      localStorage.setItem('currentUser', JSON.stringify(newData));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};