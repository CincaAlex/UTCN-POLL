import React from 'react';
import PostCard from '../../components/PostCard/PostCard'; // Updated import path
import styles from './Homepage.module.css'

const Feed = ({ posts, onUpdatePost, onDeletePost, onDeleteComment, currentUser }) => {
    return (
        <div className="feed">
            {posts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpdatePost={onUpdatePost} 
                    onDeletePost={onDeletePost} 
                    onDeleteComment={onDeleteComment} // Pass it down
                    currentUser={currentUser} 
                    className={styles.postScrollWrapper}
                />
            ))}
        </div>
    );
};

export default Feed;