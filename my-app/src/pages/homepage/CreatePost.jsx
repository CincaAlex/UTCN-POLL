import React, { useState } from 'react';
import styles from './CreatePost.module.css';

const CreatePost = ({ onCreatePost }) => {
    const [postTitle, setPostTitle] = useState(''); // New state for post title
    const [postText, setPostText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePost = async () => {
        if (!postText.trim() && !postTitle.trim()) return; // Allow posting with just title or just text

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Post submitted - Title:', postTitle, 'Body:', postText);
            onCreatePost(postTitle, postText); // Pass both title and text
            setPostTitle(''); // Clear title input
            setPostText(''); // Clear text input
        } catch (err) {
            setError('Failed to post. Please try again.');
            console.error('Error submitting post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.createPostContainer}>
            <img src="https://i.pravatar.cc/40" alt="User Avatar" className={styles.avatar} />
            <div className={styles.createPostInputSection}>
                <input // Input for post title
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title"
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                <input // Input for post body
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                <button
                    onClick={handlePost}
                    disabled={(!postTitle.trim() && !postText.trim()) || isLoading} // Disable if both are empty
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
