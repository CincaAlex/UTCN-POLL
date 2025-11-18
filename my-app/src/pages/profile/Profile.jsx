import React, { useState, useEffect } from 'react';
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

function Profile() {
  const [pageLoading, setPageLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);      
  const [userData, setUserData] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState(null);

  // 1. Fetch data on initial component load
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setPageLoading(true);
        const data = await fetchGamblerData();
        setUserData(data);
        setFormData(data);
      } catch (error) {
        console.error("Failed to fetch gambler data:", error);
      } finally {
        setPageLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
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

  if (pageLoading) {
    return (
      <div className="profile-container">
        <div className="profile-card loading-state">
          Loading Player Profile...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-card error-state">
          Error: Could not load player data.
        </div>
      </div>
    );
  }
  
  const { friends, tokens, badges, username, photoUrl } = userData;

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        <div className="edit-controls">
          <button onClick={() => setIsEditing(true)} className="btn btn-edit">
            Edit Profile
          </button>
        </div>
        
        <div className="profile-header">
          <img 
            src={photoUrl} 
            alt="Player Avatar" 
            className="profile-avatar"
          />
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

        <div calssName = "rewards-box">
            <button /*onClick = {}*/ className = "btn-rewards"> {/* trebe facut renderul pt buton */}
                Get your daily rewards
            </button>
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
    </div>
  );
}

export default Profile;