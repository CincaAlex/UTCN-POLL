import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TopBar.module.css';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';

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
    
    const { user, logout } = useContext(UserContext);

    const handleLogout = () => {
        
        if (typeof logout === 'function') {
            logout();
        } else {
            console.error("UserContext does not provide a 'logout' function.");
        }
        
        setIsAvatarMenuOpen(false);
        
        navigate('/'); 
    };

    const handleAvatarClick = () => {
        navigate('/profile');
        setIsAvatarMenuOpen(false);
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
                    {user?.userType === 'ADMIN' && (
                    <button onClick={() => navigate('/admin/polls')}>
                        🏆 Resolve Polls
                    </button>
                )}
                </nav>
                <div className={styles.topBarRight}>
                    <div 
                        className={styles.avatarContainer} 
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

export default TopBar