import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Re-adding useTheme import
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';

const initialPosts = [
    {
        id: 1,
        user: { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' },
        time: '3h',
        title: 'First time using the new platform!',
        body: 'Just wanted to say this new UTCNHub platform looks amazing. Great job to the team who built this. Looking forward to creating some polls.',
        counts: { likes: 25, comments: 2, shares: 2 },
        comments: [
            { user: { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' }, text: 'I agree, it looks great!' },
            { user: { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' }, text: 'Can\'t wait to see the new features.' },
        ],
        likedBy: [
            { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' },
            { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' },
        ]
    },
    // ... other initial posts
];

const Homepage = () => {
    const { theme } = useTheme(); // Re-adding useTheme hook call
    const scrollDirection = useScrollDirection();
    const [posts, setPosts] = useState(initialPosts);
    const [sortOrder, setSortOrder] = useState('newest'); // New state for sorting
    const [searchTerm, setSearchTerm] = useState(''); // New state for search term

    const currentUsername = 'u/current_user'; // Hardcoded current user for demonstration

    const handleCreatePost = (newTitle, newBody) => {
        const newPost = {
            id: posts.length + 1,
            user: { name: currentUsername, avatar: 'https://i.pravatar.cc/40' }, // Use currentUsername
            time: 'Just now',
            title: newTitle,
            body: newBody,
            counts: { likes: 0, comments: 0, shares: 0 },
            comments: [],
            likedBy: []
        };
        setPosts([newPost, ...posts]);
    };

    const handleUpdatePost = (id, newTitle, newBody) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === id ? { ...post, title: newTitle, body: newBody, isEdited: true } : post
            )
        );
    };

    const handleSortChange = (newSortOrder) => {
        setSortOrder(newSortOrder);
    };

    const handleSearchTermChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    };

    // Suggestions logic
    const suggestions = searchTerm
        ? posts
            .map(post => {
                if (post.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return { type: 'Post', text: post.title, id: post.id };
                }
                if (post.user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return { type: 'User', text: post.user.name, id: post.user.name };
                }
                return null;
            })
            .filter(suggestion => suggestion !== null)
            // Remove duplicates
            .filter((suggestion, index, self) =>
                index === self.findIndex((s) => (
                    s.id === suggestion.id && s.text === suggestion.text
                ))
            )
            .slice(0, 5) // Limit to 5 suggestions
        : [];

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => { // Sort the filtered posts
        switch (sortOrder) {
            case 'oldest':
                return a.id - b.id; // Assuming id reflects creation order
            case 'top':
                return b.counts.likes - a.counts.likes;
            case 'newest':
            default:
                return b.id - a.id; // Assuming id reflects creation order
        }
    });

    return (
        <div className={`${styles.homepage} ${styles[theme]}`}> {/* Re-added theme class */}
            <TopBar />
            <SearchBar 
                isHidden={scrollDirection === 'down'} 
                onSortChange={handleSortChange} 
                currentSort={sortOrder} 
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                suggestions={suggestions} // Pass suggestions
            />
            <main className={styles.mainContainer}>
                <CreatePost onCreatePost={handleCreatePost} />
                <Feed posts={sortedPosts} onUpdatePost={handleUpdatePost} currentUsername={currentUsername} /> {/* Pass sorted and filtered posts */}
            </main>
        </div>
    );
};

export default Homepage;