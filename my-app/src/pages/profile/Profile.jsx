import React, { useState, useEffect } from 'react';
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

// --- SIMULATED API CALLS ---
const fetchGamblerData = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        username: 'HighRoller_777',
        photoUrl: 'https://placehold.co/150x150/2b2d3e/CF1F23?text=HR',
        tokens: 1450230,
        friends: 100,
        pollHistory: [
          { month: 'Jan', winnings: 4000 },
          { month: 'Feb', winnings: 3000 },
          { month: 'Mar', winnings: 5500 },
          { month: 'Apr', winnings: 4800 },
          { month: 'May', winnings: 9000 },
          { month: 'Jun', winnings: 12500 },
        ],
        badges: [
          { name: 'High Roller', symbol: '💎', className: 'badge-gold' },
          { name: 'On Fire', symbol: '🔥', className: 'badge-red' },
          { name: 'Poker Shark', symbol: '🦈', className: 'badge-blue' },
        ]
      });
    }, 1000);
  });
};

const saveProfileData = (updatedData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('--- SAVED TO DATABASE (SIMULATED) ---', updatedData);
      resolve({ status: 'success', data: updatedData });
    }, 750);
  });
};

const getNextSpinTime = () => {
  const stored = localStorage.getItem('lastSpinTime');
  if (!stored) return 0; 
  return parseInt(stored, 10) + (24 * 60 * 60 * 1000); 
};

// ----------------------------------------
// DailySpinModal Component
// ----------------------------------------
function DailySpinModal({ onComplete, onClose }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState(null);

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
    
    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length; 
    
    // Math to land on the chosen segment
    const winningSegmentCenter = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const targetRotation = 360 - winningSegmentCenter;
    const totalRotation = (360 * 5) + targetRotation;

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = prizes[winnerIndex];
      setWinResult(wonPrize);
      // IMPORTANT: We REMOVED onComplete() from here.
      // It is now called only when the user clicks the button below.
    }, 4000);
  };

  // New handler for the Claim button
  const handleClaim = () => {
    if (winResult) {
      onComplete(winResult.value); // Update tokens now
    }
    onClose(); // Close modal
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel spin-container">
        <h2>Daily Lucky Spin</h2>
        
        <div className="wheel-wrapper">
          <div className="wheel-marker"></div>
          <div 
            className="wheel" 
            style={{ 
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                ${prizes.map((p, i) => `${p.color} ${i * 60}deg ${(i + 1) * 60}deg`).join(', ')}
              )`
            }}
          >
             {prizes.map((prize, i) => (
              <div 
                key={i} 
                className="wheel-label"
                style={{ 
                  transform: `translateX(-50%) rotate(${i * 60 + 30}deg)` 
                }}
              >
                {prize.label}
              </div>
            ))}
          </div>
        </div>

        {!winResult ? (
          <button 
            onClick={handleSpin} 
            className="btn btn-rewards" 
            style={{ width: 'auto', padding: '10px 40px' }}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning..." : "SPIN NOW!"}
          </button>
        ) : (
          <div className="spin-result">
            <p>Congratulations! You won:</p>
            <h3>{winResult.label} Tokens</h3>
            <button 
              onClick={handleClaim} // Call our new handler
              className="btn btn-save" 
              style={{ marginTop: '20px' }}
            >
              Claim & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------
// Edit Profile Modal
// ----------------------------------------
function EditProfileModal({ formData, onChange, onSave, onCancel, isSaving }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h2>Edit Your Profile</h2>
        <div className="form-group">
          <label className="stat-label">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            className="edit-input"
            value={formData.username}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label className="stat-label">Photo URL</label>
          <input
            type="text"
            name="photoUrl"
            id="photoUrl"
            className="edit-input"
            value={formData.photoUrl}
            onChange={onChange}
          />
        </div>
        <div className="modal-controls">
          <button onClick={onSave} className="btn btn-save" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onCancel} className="btn btn-cancel" disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// Main Profile Component
// ----------------------------------------
function Profile() {
  const [pageLoading, setPageLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);      
  const [userData, setUserData] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState(null);

  const [showSpin, setShowSpin] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setPageLoading(true);
        const data = await fetchGamblerData();
        setUserData(data);
        setFormData(data);
        checkSpinAvailability();
      } catch (error) {
        console.error("Failed to fetch gambler data:", error);
      } finally {
        setPageLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const checkSpinAvailability = () => {
    const nextSpin = getNextSpinTime();
    //const nextSpin = Date.now();
    const now = Date.now();

    if (now >= nextSpin) {
      setCanSpin(true);
      setTimeLeft("");
    } else {
      setCanSpin(false);
      const diff = nextSpin - now;
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfileData(formData);
      setUserData(formData); 
      setIsEditing(false);   
    } catch (error) {
      console.error("Failed to save data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userData);
  };

  const handleSpinComplete = async (wonAmount) => {
    localStorage.setItem('lastSpinTime', Date.now().toString());
    
    const newData = { 
      ...userData, 
      tokens: userData.tokens + wonAmount 
    };
    
    // Optimistic update: update UI immediately
    setUserData(newData);
    setFormData(newData);
    checkSpinAvailability();

    // Then save to DB
    await saveProfileData(newData);
  };

  if (pageLoading) {
    return (
      <div className="profile-container">
        <div className="profile-card loading-state">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-card error-state">Error loading data.</div>
      </div>
    );
  }
  
  const { friends, tokens, badges, username, photoUrl, pollHistory } = userData;

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        <div className="edit-controls">
          <button onClick={() => setIsEditing(true)} className="btn btn-edit">
            Edit Profile
          </button>
        </div>
        
        <div className="profile-header">
          <img src={photoUrl} alt="Player Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h1 className="username">{username}</h1>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Tokens</span>
            <span className="stat-value">{tokens.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Friends</span>
            <span className="stat-value">{friends.toLocaleString()}</span>
          </div>
        </div>

        <div className="rewards-box">
            <button 
              className={`btn-rewards ${!canSpin ? 'disabled' : ''}`}
              onClick={() => canSpin && setShowSpin(true)}
              disabled={!canSpin}
            >
                {canSpin 
                  ? "🎁 Get your daily rewards" 
                  : `⏳ Come back in ${timeLeft}`
                }
            </button>
        </div>
        
        <div className="chart-section">
          <h2>📈 Poll Performance</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pollHistory}>
                <defs>
                  <linearGradient id="colorWinnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CF1F23" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#CF1F23" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#aaa" 
                  tick={{fill: '#aaa', fontSize: 12}}
                  tickLine={false} axisLine={false}
                />
                <YAxis 
                  stroke="#aaa" 
                  tick={{fill: '#aaa', fontSize: 12}} 
                  tickLine={false} axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2b2d3e', border: '1px solid #CF1F23', borderRadius: '8px' }}
                  itemStyle={{ color: '#CF1F23' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="winnings" 
                  stroke="#CF1F23" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWinnings)" 
                />
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
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {showSpin && (
        <DailySpinModal 
          onComplete={handleSpinComplete}
          onClose={() => setShowSpin(false)}
        />
      )}
    </div>
  );
}

export default Profile;