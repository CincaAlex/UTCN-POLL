import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';
import logo from '../../assets/logo_background_negru.png';

function Welcome() {
  const { theme } = useContext(ThemeContext);
  const logo = theme === 'light' ? logoLight : logoDark;

  return (
    <div className="welcome-container">
      <img src={logo} alt="UTCN-POLL Logo" style={{ maxWidth: '300px', marginBottom: '2rem', animation: 'fadeIn 1s ease-in-out' }} />
      <h1 className="welcome-title">Welcome to UTCN-POLL</h1>
      <p className="welcome-subtitle">
        Your voice matters. Participate in polls, share your opinions, and see what the community thinks. Please log in or register to continue.
      </p>
      <div className="welcome-buttons">
        <Link to="/login" className="welcome-button">
          Login
        </Link>
        <Link to="/register" className="welcome-button">
          Register
        </Link>
      </div>
    </div>
  );
}

export default Welcome;
