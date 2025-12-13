import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { ThemeContext } from './context/ThemeContext';
import Welcome from './pages/welcome/Welcome';
import Homepage from './pages/homepage/Homepage';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Profile from './pages/profile/Profile';
import UnderConstruction from './pages/under-construction/UnderConstruction';
import CreatePolls from './pages/create-polls/CreatePolls';
import ViewPolls from './pages/view-polls/ViewPolls';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-poll" element={<CreatePolls />} />
        <Route path="/view-polls" element={<ViewPolls />} />
        <Route path="/dashboard" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
}

export default App;
