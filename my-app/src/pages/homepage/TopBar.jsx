import { useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import styles from './TopBar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';

const TopBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);

    const handleLogout = () => {
        console.log('Log out');
        setIsAvatarMenuOpen(false);
    };

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.topBarContent}>
                <div className={styles.logo}>UTCNHub</div>
                <nav className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    <button onClick={() => navigate('/create-poll')}>Create poll</button>
                </nav>
                <div className={styles.topBarRight}>
                    <div 
                        className={styles.avatarContainer} 
                        onMouseEnter={() => setIsAvatarMenuOpen(true)}
                        onMouseLeave={() => setIsAvatarMenuOpen(false)}
                    >
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="User Avatar"
                            className={styles.avatar}
                            onClick={handleAvatarClick}
                        />
                        {isAvatarMenuOpen && (
                            <div className={styles.avatarDropdown}>
                                <button onClick={toggleTheme}>
                                    Theme: {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </button>
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
