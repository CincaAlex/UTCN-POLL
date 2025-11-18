import React from 'react';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';

const Homepage = () => {
    const scrollDirection = useScrollDirection();

    return (
        <div className={styles.homepage}>
            <TopBar />
            <SearchBar isHidden={scrollDirection === 'down'} />
            <main className={styles.mainContainer}>
                <CreatePost />
                <Feed />
            </main>
        </div>
    );
};

export default Homepage;