import React, { useState } from 'react';
import styles from './CreatePost.module.css';

const CreatePost = () => {
    const [postText, setPostText] = useState('');

    const handlePost = () => {
        if (postText.trim()) {
            console.log('post:', postText);
            setPostText('');
        }
    };

    return (
        <div className={styles.createPostContainer}>
            <img src="https://i.pravatar.cc/40" alt="User Avatar" className={styles.avatar} />
            <div className={styles.createPostInputSection}>
                <input
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className={styles.createPostInput}
                />
                <button
                    onClick={handlePost}
                    disabled={!postText.trim()}
                    className={styles.createPostButton}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
