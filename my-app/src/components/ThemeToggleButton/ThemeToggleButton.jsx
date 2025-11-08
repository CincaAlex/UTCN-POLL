import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './ThemeToggleButton.css';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      className={`theme-toggle-button ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="icon sun">☀️</span>
      <span className="icon moon">🌙</span>
      <div className="slider"></div>
    </button>
  );
}

export default ThemeToggleButton;
