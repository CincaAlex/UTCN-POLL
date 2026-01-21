import React from 'react';
import PostCard from '../../components/PostCard/PostCard';
import styles from './Homepage.module.css'

const Feed = ({ posts, onUpdatePost, onDeletePost, onDeleteComment, onToggleLike, currentUser }) => {
    return (
        <div className="feed">
            {posts.map(post => (
                <PostCard 
                    key={post?.id ?? `${post?.createdAt ?? 'temp'}-${Math.random()}`}
                    post={post} 
                    onUpdatePost={onUpdatePost} 
                    onDeletePost={onDeletePost} 
                    onDeleteComment={onDeleteComment}
                    onToggleLike={onToggleLike}
                    currentUser={currentUser} 
                    className={styles.postScrollWrapper}
                />
            ))}
        </div>
    );
};

export default Feed;
