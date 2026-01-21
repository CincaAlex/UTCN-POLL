import React, { useState, useContext } from 'react';
import styles from './CreatePost.module.css';
import { FiType, FiUser } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';

const Avatar = ({ src, className }) => {
    const [hasError, setHasError] = useState(false);
    
    if (!src || hasError) {
        return <FiUser className={className} />;
    }
    
    return (
        <img 
            src={src} 
            alt="User Avatar" 
            className={className} 
            onError={() => setHasError(true)} 
        />
    );
};

const CreatePost = ({ onCreatePost }) => {
    const { user, token } = useContext(UserContext);
    const [postTitle, setPostTitle] = useState('');
    const [postText, setPostText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePost = async () => {
        if (!user || !token || (!postTitle.trim() && !postText.trim())) {
            setError('Please login to create a post and ensure title or content is not empty.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: postTitle,
                    content: postText,
                    author: user // Pass the full user object
                })
            });

            if (response.ok) {
                const newPost = await response.json(); // Assuming backend returns the created post
                onCreatePost(newPost); // Call parent handler to add new post to feed
                setPostTitle('');
                setPostText('');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to post. Please try again.');
                console.error('Error creating post:', errorData);
            }
        } catch (err) {
            setError('An error occurred during posting.');
            console.error('Network or unexpected error creating post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.createPostContainer}>
            <div className={styles.topSection}>
                <Avatar src={user?.photoUrl} className={styles.avatar} />
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${styles.activeTab}`}
                    >
                        <FiType /> Text
                    </button>
                </div>
            </div>

            <div className={styles.createPostInputSection}>
                <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title"
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                
                <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className={styles.createPostInput}
                    disabled={isLoading}
                    rows="3" // Changed to textarea for multi-line input
                />

                <button
                    onClick={handlePost}
                    disabled={(!postTitle.trim() && !postText.trim()) || isLoading || !user} // Disable if not logged in
                    className={styles.createPostButton}
                >
                    {isLoading ? 'Posting...' : 'Post'}
                </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default CreatePost;
