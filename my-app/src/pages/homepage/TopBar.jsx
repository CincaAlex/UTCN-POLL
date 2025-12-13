import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TopBar.module.css';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';

// Avatar component remains unchanged
const Avatar = ({ src, className, onClick }) => {
    const [hasError, setHasError] = useState(false);
    
    if (!src || hasError) {
        return <FiUser className={className} onClick={onClick} />;
    }
    
    return (
        <img 
            src={src} 
            alt="User Avatar" 
            className={className} 
            onClick={onClick}
            onError={() => setHasError(true)} 
        />
    );
};

const TopBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    // Destructure the necessary user context elements, including the assumed 'logout' function
    const { user, logout } = useContext(UserContext);

    const handleLogout = () => {
        console.log('Logging out user...');
        
        // 1. Clear user data (Assumes UserContext provides a 'logout' function)
        if (typeof logout === 'function') {
            logout();
        } else {
            // Fallback/Simulated clearing if context is simple
            console.error("UserContext does not provide a 'logout' function.");
        }
        
        // 2. Close the avatar menu
        setIsAvatarMenuOpen(false);
        
        // 3. Navigate to the welcome page
        navigate('/'); 
    };

    const handleAvatarClick = () => {
        // Navigate to profile and close the dropdown if open
        navigate('/profile');
        setIsAvatarMenuOpen(false); // Add this line for a better user experience
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.topBarContent}>
                <Link to="/homepage" className={styles.logoLink}>
                    <div className={styles.logo}>UTCNHub</div>
                </Link>
                <nav className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    {user?.role === 'admin' ? (
                        <button onClick={() => navigate('/create-poll')}>Create poll</button>
                    ) : (
                        <button onClick={() => navigate('/view-polls')}>View polls</button>
                    )}
                </nav>
                <div className={styles.topBarRight}>
                    <div 
                        className={styles.avatarContainer} 
                        // Using onMouse events for desktop hover
                        onMouseEnter={() => setIsAvatarMenuOpen(true)}
                        onMouseLeave={() => setIsAvatarMenuOpen(false)}
                    >
                        <Avatar 
                            src={user?.photoUrl} 
                            className={styles.avatar} 
                            onClick={handleAvatarClick} 
                        />
                        {isAvatarMenuOpen && (
                            <div className={styles.avatarDropdown}>
                                <button onClick={toggleTheme}>
                                    Theme: {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </button>
                                {/* This button now calls the fully implemented handler */}
                                <button onClick={handleLogout}>Log out</button> 
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopBar;