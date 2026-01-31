import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import { FiUser } from 'react-icons/fi';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import './Profile.css';
import Confetti from 'react-confetti';

const saveProfileData = async (userId, updatedData, token) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });
  
  if (!res.ok) throw new Error('Failed to save profile');
  return await res.json();
};

const saveSpinReward = async (userId, pointsToAdd, token) => {
  const res = await fetch(`/api/users/${userId}/addPoints?points=${pointsToAdd}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) throw new Error('Failed to add points');
  return await res.json();
};

function DailySpinModal({ onComplete, onClose, theme }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prizes = [
    { label: '100', value: 100, color: '#CF1F23' },
    { label: '500', value: 500, color: '#1a1a1a' },
    { label: '1000', value: 1000, color: '#CF1F23' },
    { label: '50', value: 50, color: '#1a1a1a' },
    { label: '2000', value: 2000, color: '#CF1F23' },
    { label: 'JACKPOT', value: 10000, color: '#FFD700' }
  ];

  const handleSpin = () => {
    if (isSpinning || winResult) return;
    setIsSpinning(true);
    setWinResult(null);

    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const winningSegmentCenter = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const targetRotation = 360 - winningSegmentCenter;
    const totalRotation = (360 * 5) + targetRotation;
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = prizes[winnerIndex];
      setWinResult(wonPrize);
    }, 4000);
  };

  const handleClaim = () => {
    if (winResult) onComplete(winResult.value);
    onClose();
  };

  return (
    <div className={`modal-backdrop ${theme}`}>
      {winResult && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={prizes.map(p => p.color)}
        />
      )}
      <div className={`modal-panel ${theme} spin-container`}>
        <h2>Daily Lucky Spin</h2>
        <div className="wheel-wrapper">
          <div className="wheel-marker"></div>
          <div
            className="wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${prizes.map((p, i) => `${p.color} ${i * 60}deg ${(i + 1) * 60}deg`).join(', ')})`
            }}
          >
            {prizes.map((prize, i) => (
              <div key={i} className="wheel-label" style={{ transform: `translateX(-50%) rotate(${i * 60 + 30}deg)` }}>
                {prize.label}
              </div>
            ))}
          </div>
        </div>
        {!winResult ? (
          <button onClick={handleSpin} className={`btn btn-save ${theme}`} disabled={isSpinning}>
            {isSpinning ? "Spinning..." : "SPIN NOW!"}
          </button>
        ) : (
          <div className="spin-result">
            <p>Congratulations! You won:</p>
            <h3>{winResult.label} Tokens</h3>
            <button onClick={handleClaim} className={`btn btn-save ${theme}`} style={{ marginTop: '20px' }}>
              Claim & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EditProfileModal({ formData, onChange, onFileChange, onSave, onCancel, isSaving, theme }) {
  return (
    <div className={`modal-backdrop ${theme}`}>
      <div className={`modal-panel ${theme}`}>
        <h2>Edit Your Profile</h2>

        <div className="form-group">
          <label className="stat-label">Username</label>
          <input type="text" name="username" value={formData.username ?? ""} onChange={onChange} className="edit-input" />
        </div>

        <div className="form-group">
          <label className="stat-label">Photo</label>
          <input type="file" accept="image/*" onChange={onFileChange} className="edit-input" />
        </div>

        <div className="modal-controls">
          <button onClick={onSave} className={`btn btn-save ${theme}`} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onCancel} className={`btn btn-cancel ${theme}`} disabled={isSaving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const Avatar = ({ src, className, alt = "Player Avatar" }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <FiUser className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

function Profile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showSpin, setShowSpin] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const { theme } = useContext(ThemeContext);
  const { user, updateUser, loading, token } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setFormData(user);
      checkSpinAvailability();
    }
  }, [user]);

  const checkSpinAvailability = () => {
    if (!user) return;

    const lastSpinDate = user?.lastSpinDate;
    
    if (!lastSpinDate) {
      setCanSpin(true);
      setTimeLeft("");
      return;
    }

    const lastSpin = new Date(lastSpinDate);
    const now = new Date();
    
    lastSpin.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffInMs = now - lastSpin;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays >= 1) {
      setCanSpin(true);
      setTimeLeft("");
    } else {
      setCanSpin(false);
      const nextSpinDate = new Date(lastSpin);
      nextSpinDate.setDate(nextSpinDate.getDate() + 1);
      nextSpinDate.setHours(0, 0, 0, 0);
      
      const timeRemaining = nextSpinDate - new Date();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...(prev ?? {}), [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...(prev ?? {}),
      photoUrl: imageUrl,
      photoFile: file
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfileData(user.id, formData, token);
      updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Eroare la salvarea profilului. Te rog încearcă din nou.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(user);
  };

  const handleSpinComplete = async (wonAmount) => {
    try {
      await saveSpinReward(user.id, wonAmount, token);
      
      const today = new Date().toISOString().split('T')[0];
      await fetch(`/api/users/${user.id}/updateLastSpin?date=${today}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const currentPoints = Number(user?.points ?? 0);
      const newData = { 
        ...user, 
        points: currentPoints + Number(wonAmount ?? 0),
        lastSpinDate: today
      };
      
      updateUser(newData);
      setFormData(newData);
      checkSpinAvailability();
      
    } catch (error) {
      console.error("Failed to save spin reward:", error);
      alert("Eroare la salvarea punctelor. Te rog încearcă din nou.");
    }
  };

  if (loading) return (
    <div className={`profile-container ${theme}`}>
      <div className="profile-card loading-state">Loading...</div>
    </div>
  );

  if (!user) return (
    <div className={`profile-container ${theme}`}>
      <div className="profile-card error-state">Error loading data.</div>
    </div>
  );

  const username = user?.username ?? user?.name ?? "Unknown";
  const photoUrl = user?.photoUrl ?? null;

  const tokens = Number(user?.points ?? 0);

  const friends = Number(user?.friends ?? 0);

  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const pollHistory = Array.isArray(user?.pollHistory) ? user.pollHistory : [];

  return (
    <div className={`profile-container ${theme}`}>
      <div className={`profile-card ${theme}`}>
        <div className="edit-controls">
          <button onClick={() => setIsEditing(true)} className={`btn btn-edit ${theme}`}>Edit Profile</button>
        </div>

        <div className="profile-header">
          <Avatar src={photoUrl} className="profile-avatar" />
          <div className="profile-info">
            <h1 className="username">{username}</h1>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Tokens de pariat</span>
            <span className="stat-value">{tokens.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Friends</span>
            <span className="stat-value">{friends.toLocaleString()}</span>
          </div>
        </div>

        <div className="rewards-box">
          <button
            className={`btn-rewards ${theme} ${!canSpin ? 'disabled' : ''}`}
            onClick={() => canSpin && setShowSpin(true)}
            disabled={!canSpin}
          >
            {canSpin ? "🎁 Get your daily rewards" : `⏳ Come back in ${timeLeft}`}
          </button>
        </div>

        <div className="chart-section">
          <h2>📈 Poll Performance</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pollHistory}>
                <defs>
                  <linearGradient id="colorWinnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CF1F23" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CF1F23" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="month" stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#2b2d3e', border: '1px solid #CF1F23', borderRadius: '8px' }} itemStyle={{ color: '#CF1F23' }} />
                <Area type="monotone" dataKey="winnings" stroke="#CF1F23" strokeWidth={3} fillOpacity={1} fill="url(#colorWinnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="badges-section">
          <h2>🏆 Achievements</h2>
          <div className="badges-list">
            {badges.map((badge, index) => (
              <div key={index} className={`badge ${badge.className}`}>
                <span className="badge-icon">{badge.symbol}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal
          formData={formData}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
          theme={theme}
        />
      )}

      {showSpin && (
        <DailySpinModal
          onComplete={handleSpinComplete}
          onClose={() => setShowSpin(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

export default Profile;
