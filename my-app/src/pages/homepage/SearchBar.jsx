import React, { useState } from 'react';
import styles from './SearchBar.module.css';
import { FiSearch, FiUser } from 'react-icons/fi';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const UserProfilePopup = ({ user, onClose, theme }) => {
  if (!user) return null;

  const { friends = 0, tokens = 0, badges = [], username, photoUrl, pollHistory = [] } = user;

  return (
    <div className={`modal-backdrop ${theme}`} onClick={onClose}>
      {}
      <div
            className={`modal-panel ${theme}`}
            style={{
                maxWidth: '600px',
                maxHeight: '85vh',
                overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
        >   


        <div className="profile-header">
          {photoUrl ? (
            <img src={photoUrl} alt={username} className="profile-avatar" />
          ) : (
            <FiUser className="profile-avatar" />
          )}
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

        <div className="chart-section">
          <h2>📈 Poll Performance</h2>
          <div className="chart-container" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pollHistory}>
                <defs>
                  <linearGradient id="colorWinnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CF1F23" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#CF1F23" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="month" stroke="#aaa" tick={{fill: '#aaa', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis stroke="#aaa" tick={{fill: '#aaa', fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#2b2d3e', border: '1px solid #CF1F23', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="winnings" stroke="#CF1F23" strokeWidth={3} fill="url(#colorWinnings)" />
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
        
        <div className="modal-controls">
          <button onClick={onClose} className={`btn btn-save ${theme}`}>Close View</button>
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ isHidden, onSortChange, currentSort, searchTerm, onSearchTermChange, suggestions, theme }) => {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'user') {
            setSelectedUser(suggestion.userData || suggestion);
        } else if (suggestion.type === 'post') {
            const targetId = `scroll-${suggestion.id}`;
            const element = document.getElementById(targetId);

            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
                element.classList.add('post-highlight-active');
            
                setTimeout(() => {
                    element.classList.remove('post-highlight-active');
                }, 3000);
        
            onSearchTermChange(''); 
        }
    }
};

    return (
        <>
            <div className={`${styles.searchBarContainer} ${isHidden ? styles.hidden : ''}`}>
                <form 
                    className={`${styles.searchBar} ${suggestions && suggestions.length > 0 ? styles.suggestionsActive : ''}`} 
                    onSubmit={handleSearch}
                >
                    <div className={styles.searchInputContainer}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search posts, users or subjects..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    {suggestions && suggestions.length > 0 && (
                        <div className={`${styles.suggestionsDropdown} ${styles.suggestionsVisible}`}>
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index} 
                                    className={styles.suggestionItem}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.text} ({suggestion.type})
                                </div>
                            ))}
                        </div>
                    )}
                </form>
                <div className={styles.sortContainer}>
                    <label htmlFor="sort-posts">Sort by:</label>
                    <select 
                        id="sort-posts"
                        value={currentSort}
                        onChange={(e) => onSortChange(e.target.value)}
                        className={styles.sortDropdown}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="top">Top</option>
                    </select>
                </div>
            </div>

            {/* Profile Modal Trigger */}
            {selectedUser && (
                <UserProfilePopup 
                    user={selectedUser} 
                    theme={theme} 
                    onClose={() => setSelectedUser(null)} 
                />
            )}
        </>
    );
};

export default SearchBar;