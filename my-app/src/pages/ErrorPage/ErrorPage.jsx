import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ErrorPage.module.css'; // Asigură-te că extensia este .module.css

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1>Access Denied</h1>
            <p>You must be logged in to view this post.</p>

            <button 
                className={styles.loginBtn} 
                onClick={() => navigate('/')}
            >
                Go to Welcome Page
            </button>
        </div>
    );
};

export default ErrorPage;