import React from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { Container, Typography, Button, Box } from '@mui/material';
import logo from '../../assets/logo_full.png';
=======
import './Welcome.css';
import logo from '../../assets/logo_background_negru.png'; // Assuming you have a logo to import
>>>>>>> 09f16602226ce76b031f725e26a16afb96160505

function Welcome() {
  return (
    <div className="welcome-container">
      <img src={logo} alt="UTCN-POLL Logo" style={{ maxWidth: '300px', marginBottom: '2rem', animation: 'fadeIn 1s ease-in-out' }} />
      <h1 className="welcome-title">Welcome to UTCN-POLL</h1>
      <div className="welcome-buttons">
        <Link to="/login" className="welcome-button">
          Login
        </Link>
        <Link to="/register" className="welcome-button">
          Register
<<<<<<< HEAD
        </Button>
        <img src={logo} className="logo" alt="UTCN_Poll_logo" />
      </Box>
    </Container>
=======
        </Link>
      </div>
    </div>
>>>>>>> 09f16602226ce76b031f725e26a16afb96160505
  );
}

export default Welcome;
