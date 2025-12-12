import React, { useState, useContext } from 'react';
import styles from './CreatePost.module.css';
import { FiType, FiUser } from 'react-icons/fi'; // Removed FiBarChart2, FiPlus, FiX
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom'; // Import Link

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
    const { user } = useContext(UserContext);
    const [postTitle, setPostTitle] = useState('');
    const [postText, setPostText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePost = async () => {
        if (!postTitle.trim() && !postText.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            onCreatePost(postTitle, postText, 'text', []); // Always 'text' type

            setPostTitle('');
            setPostText('');
        } catch (err) {
            setError('Failed to post. Please try again.');
            console.error('Error submitting post:', err);
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
                        className={`${styles.tabButton} ${styles.activeTab}`} // Always active for text posts
                    >
                        <FiType /> Text
                    </button>
                    {/* Replaced Poll tab with a Link to the Create Polls page */}
                    <Link to="/create-poll" className={styles.tabButton}> 
                        <FiType /> Poll
                    </Link>
                </div>
            </div>

            <div className={styles.createPostInputSection}>
                <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title" // Simplified placeholder
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                
                <input // Always render text input
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className={styles.createPostInput}
                    disabled={isLoading}
                />

                <button
                    onClick={handlePost}
                    disabled={(!postTitle.trim() && !postText.trim()) || isLoading} // Simplified disabled logic
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