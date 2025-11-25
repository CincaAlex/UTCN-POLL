import React from 'react';
import PostCard from './PostCard';

const Feed = ({ posts, onUpdatePost, currentUsername }) => { // Accept currentUsername prop
    return (
        <div className="feed">
            {posts.map(post => (
                <PostCard key={post.id} post={post} onUpdatePost={onUpdatePost} currentUsername={currentUsername} />
            ))}
        </div>
    );
};

export default Feed;