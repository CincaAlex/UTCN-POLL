import React from 'react';
import styles from './SearchBar.module.css';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ isHidden, onSortChange, currentSort, searchTerm, onSearchTermChange, suggestions }) => {

    const handleSearch = (e) => {
        e.preventDefault();
        // The search is now handled live in Homepage.jsx as the user types.
        // This function can be kept for future explicit search actions, or removed.
        console.log('Search submitted for:', searchTerm);
    };

    return (
        <div className={`${styles.searchBarContainer} ${isHidden ? styles.hidden : ''}`}>
            <form 
                className={`${styles.searchBar} ${suggestions && suggestions.length > 0 ? styles.suggestionsActive : ''}`} 
                onSubmit={handleSearch}
            >
                <div className={styles.searchInputContainer}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search polls, users or subjects..."
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
                                onClick={() => console.log('Selected:', suggestion)}
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
    );
};

export default SearchBar;