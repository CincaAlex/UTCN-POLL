import React, { useState, useContext } from 'react';
import styles from './PostCard.module.css';
import { FiThumbsUp, FiMessageSquare, FiShare2, FiEdit2, FiTrash2, FiCheck, FiX, FiTrash } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment }) => {
    const { user } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(post.title);
    const [editedBody, setEditedBody] = useState(post.body);

    const currentUser = user ? { name: user.name || user.username, role: user.role } : null;
    const isPostOwner = currentUser && post.user && post.user.name === currentUser.name;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const canManagePost = isPostOwner; // Only owner can manage their posts, even for admins

    const handleLike = () => {
        // Implement like logic here
        console.log(`Liked post ${post.id}`);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        onUpdatePost(post.id, editedTitle, editedBody);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTitle(post.title);
        setEditedBody(post.body);
    };

    return (
        <div className={styles.postCard}>
            <div className={styles.postHeader}>
                {canManagePost && (
                    <div className={styles.postActionsMenu}>
                        {isEditing ? (
                            <>
                                <button className={styles.postActionButton} onClick={handleSaveEdit} title="Save">
                                    <FiCheck />
                                </button>
                                <button className={styles.postActionButton} onClick={handleCancelEdit} title="Cancel">
                                    <FiX />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className={styles.postActionButton} onClick={handleEdit} title="Edit Post">
                                    <FiEdit2 />
                                </button>
                                <button className={`${styles.postActionButton} ${styles.delete}`} onClick={() => onDeletePost(post.id)} title="Delete Post">
                                    <FiTrash2 />
                                </button>
                            </>
                        )}
                    </div>
                )}
                <img src={post.user.avatar} alt={post.user.name} className={styles.avatar} />
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{post.user.name}</div>
                    <div className={styles.postTime}>{post.time}</div>
                </div>
            </div>

            {isEditing ? (
                <>
                    <input 
                        type="text" 
                        value={editedTitle} 
                        onChange={(e) => setEditedTitle(e.target.value)} 
                        className={styles.editInput} 
                        style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}
                    />
                    <textarea 
                        value={editedBody} 
                        onChange={(e) => setEditedBody(e.target.value)} 
                        className={styles.editTextArea}
                        style={{width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}
                    />
                </>
            ) : (
                <>
                    <div className={styles.postTitle}>{post.title}</div>
                    <div className={styles.postBody}>{post.body}</div>
                </>
            )}

            <div className={styles.postFooter}>
                <div className={styles.postActions}>
                    <button className={styles.actionButton} onClick={handleLike}>
                        <FiThumbsUp /> Like
                    </button>
                    <button className={styles.actionButton}>
                        <FiMessageSquare /> Comment
                    </button>
                    <button className={styles.actionButton}>
                        <FiShare2 /> Share
                    </button>
                </div>
                <div className={styles.likeCount}>{post.counts.likes} Likes</div>
            </div>

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
                <div className={styles.commentsSection}>
                    <h4 className={styles.commentsHeader}>Comments</h4>
                    {post.comments.map((comment, index) => {
                        const isCommentOwner = currentUser && comment.user && comment.user.name === currentUser.name;
                        const canDeleteComment = isPostOwner || isCommentOwner; // Restrict to post owner or comment owner

                        return (
                            <div key={index} className={styles.comment}>
                                <img src={comment.user.avatar} alt={comment.user.name} className={styles.commentAvatar} />
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeaderRow}>
                                        <div className={styles.commentAuthor}>{comment.user.name}</div>
                                        {canDeleteComment && (
                                            <button 
                                                className={styles.deleteCommentBtn} 
                                                onClick={() => onDeleteComment(post.id, index)}
                                                title="Delete Comment"
                                            >
                                                <FiTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.commentText}>{comment.text}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PostCard;
