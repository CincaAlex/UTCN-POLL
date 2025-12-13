import React, { useState, useContext } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';

// Initial posts data for homepage (no polls here, they are in ViewPolls)
const initialHomepagePosts = [
    {
        id: 1,
        user: { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' },
        time: '3h',
        title: 'Welcome to UTCNHub!',
        body: 'Just wanted to say this new UTCNHub platform looks amazing. Great job to the team who built this. Looking forward to connecting with students and faculty.',
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
    {
        id: 2,
        user: { name: 'Secretariat AC', avatar: 'https://i.pravatar.cc/24?u=secretariat' },
        time: '5h',
        title: 'Upcoming Exam Session Schedule',
        body: 'Heads up to all students! The preliminary exam session schedule for the summer semester has been posted on Moodle. Please check it and report any conflicts by next Friday.',
        counts: { likes: 45, comments: 5, shares: 10 },
        comments: [
            { user: { name: 'u/dev_one', avatar: 'https://i.pravatar.cc/24?u=dev_one' }, text: 'Thanks for the heads up!' },
            { user: { name: 'u/student_rep', avatar: 'https://i.pravatar.cc/24?u=student_rep' }, text: 'We will forward all conflict reports from students in our group.' },
        ],
        likedBy: [
            { name: 'u/dev_one', avatar: 'https://i.pravatar.cc/24?u=dev_one', reaction: 'like' },
            { name: 'u/student_rep', avatar: 'https://i.pravatar.cc/24?u=student_rep', reaction: 'heart' },
        ]
    }
];

const Homepage = () => {
    const { theme } = useTheme();
    const { user } = useContext(UserContext);
    const scrollDirection = useScrollDirection();
    const [posts, setPosts] = useState(initialHomepagePosts); // Use specific homepage posts
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');

    const currentUser = user ? { name: user.name || user.username, role: user.role } : null;

    const handleCreatePost = (newTitle, newBody) => {
        const newPost = {
            id: Date.now(), // Unique ID
            user: { name: currentUser.name, avatar: user?.photoUrl || 'https://i.pravatar.cc/40' },
            time: 'Just now',
            title: newTitle,
            body: newBody,
            counts: { likes: 0, comments: 0, shares: 0 },
            comments: [],
            likedBy: [],
            type: 'text'
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

    const handleDeletePost = (id) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
        }
    };

    const handleDeleteComment = (postId, commentIndex) => {
        if (window.confirm("Delete this comment?")) {
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    const updatedComments = post.comments.filter((_, index) => index !== commentIndex);
                    return { ...post, comments: updatedComments, counts: { ...post.counts, comments: updatedComments.length } };
                }
                return post;
            }));
        }
    };

    const handleSortChange = (newSortOrder) => {
        setSortOrder(newSortOrder);
    };

    const handleSearchTermChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    };

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
            .filter((suggestion, index, self) =>
                index === self.findIndex((s) => (
                    s.id === suggestion.id && s.text === suggestion.text
                ))
            )
            .slice(0, 5)
        : [];

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        switch (sortOrder) {
            case 'oldest':
                return a.id - b.id;
            case 'top':
                return b.counts.likes - a.counts.likes;
            case 'newest':
            default:
                return b.id - a.id;
        }
    });

    return (
        <div className={`${styles.homepage} ${styles[theme]}`}>
            <TopBar />
            <SearchBar 
                isHidden={scrollDirection === 'down'} 
                onSortChange={handleSortChange} 
                currentSort={sortOrder} 
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                suggestions={suggestions}
            />
            <main className={styles.mainContainer}>
                <CreatePost onCreatePost={handleCreatePost} />
                <Feed 
                    posts={sortedPosts} 
                    onUpdatePost={handleUpdatePost} 
                    onDeletePost={handleDeletePost} 
                    onDeleteComment={handleDeleteComment} // Pass new handler
                    currentUser={currentUser} 
                />
            </main>
        </div>
    );
};

export default Homepage;