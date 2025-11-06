import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import logo from '../../assets/logo_full.png';

function Welcome() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to UTCN-POLL
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Please log in or register to continue.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mr: 2 }}
        >
          Login
        </Button>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="secondary"
          size="large"
        >
          Register
        </Button>
        <img src={logo} className="logo" alt="UTCN_Poll_logo" />
      </Box>
    </Container>
  );
}

export default Welcome;
