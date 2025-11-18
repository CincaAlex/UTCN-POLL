import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './profile/Profile'

function ProfileTest() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default ProfileTest;