import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import styles from './PostAccessAuth.module.css';

const PostAccessAuth = ({ onAuthSuccess, onCancel }) => {
    const { login } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login('user'); 
            onAuthSuccess();
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.authContainer}>
                <h2>Login</h2>
                <p className={styles.subtitle}>Authentication required to view post</p>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <span className={styles.label}>Email Address</span>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <span className={styles.label}>Password</span>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    {error && <span className={styles.errorText}>{error}</span>}

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.loginBtn}>
                            Login
                        </button>
                        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                            Cancel and Go Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostAccessAuth;