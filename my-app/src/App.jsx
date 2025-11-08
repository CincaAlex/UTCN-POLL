import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { ThemeContext } from './context/ThemeContext';
import Welcome from './pages/welcome/Welcome';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import ThemeToggleButton from './components/ThemeToggleButton/ThemeToggleButton';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <ThemeToggleButton />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;