import React, { useState, useContext, useLayoutEffect, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useNavigate } from 'react-router-dom';
import PostAccessAuth from '../../components/PostAccessAuth/PostAccessAuth';

const Homepage = () => {
    const { theme } = useTheme();
    const { user, token, loading: userLoading } = useContext(UserContext);
    const scrollDirection = useScrollDirection();

    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingPostHash, setPendingPostHash] = useState(null);
    const [postsLoading, setPostsLoading] = useState(true);

    const hasCaptured = useRef(false);
    
    const navigate = useNavigate();

    // Fetch posts on component mount
    useEffect(() => {
        const fetchPosts = async () => {
            setPostsLoading(true);
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json();
                    // Sort by newest by default if no sortOrder is set
                    const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setPosts(sortedData);
                } else {
                    console.error('Failed to fetch posts');
                    setPosts([]);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                setPosts([]);
            } finally {
                setPostsLoading(false);
            }
        };

        if (!userLoading) { // Only fetch posts once user loading is complete
            fetchPosts();
        }
    }, [userLoading]); // Dependency on userLoading to trigger fetch after user context is ready

    const getSuggestions = () => {
        if (!searchTerm) return [];

        // For now, user suggestions are empty as user fetching is not implemented for search
        const userSuggestions = []; 

        const postSuggestions = posts
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.body.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(p => ({
                text: p.title,
                type: 'post',
                id: p.id
            }));

        return [...userSuggestions, ...postSuggestions].slice(0, 5); // Limit to top 5
    };

    // Scroll to a post if hash exists
    const handleScrollToPost = useCallback(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            if (!user) return; // Only scroll if user is logged in

            const postId = hash.replace('#post-', '');
            const targetId = `#scroll-${postId}`;

            setTimeout(() => {
                const element = document.querySelector(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.replaceState(null, '', window.location.pathname);
                }
            }, 800); 
        }
    }, [user]);

    // Handle initial load with hash for post
    useLayoutEffect(() => {
        if (hasCaptured.current) return;

        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            hasCaptured.current = true;
            setPendingPostHash(hash);
            window.history.replaceState(null, '', window.location.pathname); // Clear hash from URL

            if (!user && !userLoading) { // If not logged in and user context finished loading
                setIsLoginModalOpen(true);
            } else if (user && !userLoading) { // If logged in, scroll immediately
                handleScrollToPost();
            }
        }
    }, [user, userLoading, handleScrollToPost]); // Dependencies on user and userLoading

    // --- Modal Handlers ---
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        if (pendingPostHash) {
            window.location.hash = pendingPostHash; // Re-add hash to trigger scroll
            // handleScrollToPost is already set to run from useLayoutEffect if hash is present
            setPendingPostHash(null);
        }
    };

    const handleLoginModalClose = () => {
        setIsLoginModalOpen(false);
        if (pendingPostHash) {
            navigate('/access-denied', { replace: true });
            setPendingPostHash(null);
        }
    };

    // --- Post CRUD handlers ---
    const handleCreatePost = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handleUpdatePost = async (id, newTitle, newBody) => {
        if (!token) {
            console.error("No authentication token found for updating post.");
            return;
        }
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBody) // Backend expects raw content string
            });

            if (response.ok) {
                // Assuming backend returns the updated post or success message
                setPosts(prev => prev.map(post => post.id === id ? { ...post, title: newTitle, body: newBody, isEdited: true } : post));
            } else {
                console.error('Failed to update post:', response.status, response.statusText);
                const errorData = await response.json();
                console.error("Error details:", errorData);
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async (id) => {
        if (!token) {
            console.error("No authentication token found for deleting post.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await fetch(`/api/posts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setPosts(prev => prev.filter(post => post.id !== id));
                } else {
                    console.error('Failed to delete post:', response.status, response.statusText);
                    const errorData = await response.json();
                    console.error("Error details:", errorData);
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!token) {
            console.error("No authentication token found for deleting comment.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const response = await fetch(`/api/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setPosts(prev => prev.map(post => {
                        if (post.id === postId) {
                            // Filter out the deleted comment
                            const updatedComments = post.comments.filter(comment => comment.id !== commentId);
                            // Also update the comment count
                            return { ...post, comments: updatedComments, counts: { ...post.counts, comments: updatedComments.length } };
                        }
                        return post;
                    }));
                } else {
                    console.error('Failed to delete comment:', response.status, response.statusText);
                    const errorData = await response.json();
                    console.error("Error details:", errorData);
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    // --- Sorting & Search ---
    const handleSortChange = (newSortOrder) => setSortOrder(newSortOrder);
    const handleSearchTermChange = (newSearchTerm) => setSearchTerm(newSearchTerm);

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) // Use post.author.name
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        switch (sortOrder) {
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'top': return b.likedBy.length - a.likedBy.length; // Assuming likedBy is an array of user IDs
            default: return 0;
        }
    });

    if (userLoading || postsLoading) {
        return <div className={styles.loadingContainer}>Loading homepage...</div>;
    }

    return (
        <div className={`${styles.homepage} ${styles[theme]}`}>
            {isLoginModalOpen && (
                <PostAccessAuth 
                    onAuthSuccess={handleLoginSuccess} 
                    onCancel={handleLoginModalClose} 
                />
            )}

            <TopBar />
            <SearchBar 
                isHidden={scrollDirection === 'down'} 
                onSortChange={handleSortChange} 
                currentSort={sortOrder} 
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                suggestions={getSuggestions()}
                theme={theme}
            />
            <main className={styles.mainContainer}>
                <CreatePost onCreatePost={handleCreatePost} />
                <Feed 
                    posts={sortedPosts} 
                    onUpdatePost={handleUpdatePost} 
                    onDeletePost={handleDeletePost} 
                    onDeleteComment={handleDeleteComment} 
                />
            </main>
        </div>
    );
};

export default Homepage;
