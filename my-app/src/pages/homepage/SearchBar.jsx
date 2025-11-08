import React, { useState } from 'react';
import styles from './SearchBar.module.css';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ isHidden }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            console.log('search:', searchTerm);
        }
    };

    return (
        <div className={`${styles.searchBarContainer} ${isHidden ? styles.hidden : ''}`}>
            <form className={styles.searchBar} onSubmit={handleSearch}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search polls, users or subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </form>
        </div>
    );
};

export default SearchBar;