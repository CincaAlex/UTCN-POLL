import React, { useState, useRef, useContext, useEffect } from 'react';
import styles from './PostCard.module.css';
import { FiMessageSquare, FiShare2, FiEdit2, FiTrash2, FiUser, FiCheck, FiX, FiTrash, FiClipboard } from 'react-icons/fi';
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Modal from '../../components/Modal/Modal';
import { UserContext } from '../../context/UserContext';

// Utility to format Date objects as relative time (Unchanged)
const formatRelativeTime = (timeString) => {
    try {
        const date = new Date(timeString);
        if (isNaN(date)) return timeString;
        
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
    
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 3600)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 86400)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    } catch {
        return timeString;
    }
};

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment }) => {
    
    const { id, author, createdAt, title, content, isEdited, comments: initialComments, likedBy } = post;
    const { user, token } = useContext(UserContext);
    
    const loggedInUser = user ? { 
        id: user.id,
        name: user.name, 
        role: user.userType,
        photoUrl: user.photoUrl 
    } : null;
    
    const isPostOwner = loggedInUser && author && author.id === loggedInUser.id;
    const isAdmin = loggedInUser && loggedInUser.role === 'ADMIN';
    const canManagePost = isPostOwner || isAdmin; 

    const [isShareVisible, setShareVisible] = useState(false);
    const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
    const [isLikesModalOpen, setLikesModalOpen] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedBody, setEditedBody] = useState(content); // Use 'content' for body

    const [comments, setComments] = useState(initialComments || []);
    const [currentLikedBy, setCurrentLikedBy] = useState(likedBy || []);
    const [isLiked, setIsLiked] = useState(user && currentLikedBy.includes(user.id));
    const [counts, setCounts] = useState({
        likes: currentLikedBy.length,
        comments: (initialComments || []).length,
    });
    const [newComment, setNewComment] = useState('');

    const shareContainerRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // --- EFFECT: Close share window when clicking outside ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isShareVisible && shareContainerRef.current && !shareContainerRef.current.contains(event.target)) {
                setShareVisible(false);
            }
        };
        setTimeout(() => setCopied(false), 100); 
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isShareVisible, shareContainerRef]);

    const handleLike = async () => {
        if (!user || !token) return; 

        try {
            // The backend expects a User object, so we pass the current user from context
            const response = await fetch(`/api/posts/${id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                if (isLiked) {
                    setIsLiked(false);
                    setCounts(prev => ({ ...prev, likes: prev.likes - 1 }));
                    setCurrentLikedBy(prev => prev.filter(userId => userId !== user.id));
                } else {
                    setIsLiked(true);
                    setCounts(prev => ({ ...prev, likes: prev.likes + 1 }));
                    setCurrentLikedBy(prev => [...prev, user.id]); 
                }
            } else {
                console.error('Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user || !token || newComment.trim() === '') return;
        
        try {
            const response = await fetch(`/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    author: user, // Pass the current user object as author
                    comment: newComment.trim()
                })
            });

            if (response.ok) {
                const addedComment = await response.json(); // Backend returns the added comment
                setComments(prev => [...prev, addedComment]);
                setCounts(prev => ({ ...prev, comments: prev.comments + 1 }));
                setNewComment('');
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteCommentLocal = (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            // Call the onDeleteComment prop from Homepage
            onDeleteComment(id, commentId);
            // Optimistically update local state
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            setCounts(prev => ({ ...prev, comments: prev.comments - 1 }));
        }
    };

    const handleEditClick = () => setIsEditing(true);
    const handleSaveClick = () => { onUpdatePost(id, editedTitle, editedBody); setIsEditing(false); };
    const handleCancelClick = () => { setIsEditing(false); setEditedTitle(title); setEditedBody(content); };
    const handleDeletePostLocal = () => { if(window.confirm("Are you sure you want to delete this post?")) onDeletePost(id); };

    const Avatar = ({ src, alt, className }) => {
        const [hasError, setHasError] = useState(false);
        if (!src || hasError) return <FiUser className={className} />;
        return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
    };

    // Helper to determine avatar source
    const getAvatarSrc = (avatarUrl) => avatarUrl || 'https://i.pravatar.cc/40';

    const postLink = `${window.location.origin}${window.location.pathname}#post-${id}`;
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(postLink);
        setCopied(true);
    };

    return (
        <div key={post.id} id={`scroll-${post.id}`} className={styles.postCard}>
            {/* Likes Modal */}
            <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="People Who Liked This">
                <div className={styles.userList}>
                    {currentLikedBy.map((userId) => (
                        <div key={userId} className={styles.userListItem}>
                            {/* Fetching user details would require another API call. For now, display ID. */}
                            <FiUser className={styles.avatar} />
                            <span style={{marginLeft: '0.75rem'}}>User ID: {userId}</span>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Post Header */}
            <div className={styles.postHeader}>
                <Avatar src={getAvatarSrc(author.photoUrl)} alt="Author Avatar" className={styles.avatar} />
                <span className={styles.username}>{author.name}</span>
                <span className={styles.postTime}>
                    ⋅ {formatRelativeTime(createdAt)} {isEdited && <span className={styles.editedIndicator}>(edited)</span>}
                </span>

                {canManagePost && (
                    <div className={styles.postActionsMenu}>
                        {isEditing ? (
                            <>
                                <button className={styles.postActionButton} onClick={handleSaveClick} title="Save"><FiCheck /></button>
                                <button className={styles.postActionButton} onClick={handleCancelClick} title="Cancel"><FiX /></button>
                            </>
                        ) : (
                            <>
                                {isPostOwner && <button className={styles.postActionButton} onClick={handleEditClick} title="Edit Post"><FiEdit2 /></button>}
                                <button className={`${styles.postActionButton} ${styles.delete}`} onClick={handleDeletePostLocal} title="Delete Post"><FiTrash2 /></button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className={styles.postContent}>
                {isEditing ? (
                    <>
                        <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className={styles.editTitleInput} />
                        <textarea value={editedBody} onChange={(e) => setEditedBody(e.target.value)} className={styles.editBodyTextarea} />
                        <div className={styles.editActions}>
                            <button onClick={handleSaveClick}>Save</button>
                            <button onClick={handleCancelClick}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className={styles.postTitle}>{title}</h3>
                        <p className={styles.postBody}>{content}</p>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className={styles.postStats}>
                <span onClick={() => currentLikedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
                <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
                <span>{post.shares || 0} Shares</span> {/* Assuming shares count comes directly from post */}
            </div>

            {/* Footer: Like / Comment / Share */}
            <div className={styles.postFooter}>
                <div className={styles.reactionsContainer}>
                    <button className={`${styles.likeButton} ${isLiked ? styles.active : ''}`} onClick={handleLike}>
                        {isLiked ? <AiFillLike className={styles.likeIcon} /> : <AiOutlineLike />} Like
                    </button>
                </div>
                <div className={styles.actionButtons}>
                    <button onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}><FiMessageSquare /> Comments</button>
                    
                    {/* Share Container */}
                    <div className={styles.shareContainer} ref={shareContainerRef}>
                        <button onClick={() => setShareVisible(!isShareVisible)}><FiShare2 /> Share</button>
                        {isShareVisible && (
                            <div className={styles.shareWindow}>
                                <input type="text" readOnly value={postLink} />
                                <button onClick={handleCopyLink}>
                                    <FiClipboard /> {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comment Section */}
            <div className={`${styles.commentSection} ${isCommentSectionVisible ? styles.visible : ''}`}>
                <form onSubmit={handleAddComment} className={styles.commentForm}>
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className={styles.commentInput} />
                    <button type="submit" className={`${styles.commentPostButtonBase} ${newComment.trim() === '' ? styles.disabledPostButton : styles.commentPostButtonEnabled}`} disabled={newComment.trim() === ''}>Post</button>
                </form>
                <div className={styles.commentList}>
                    {comments.map((comment) => {
                        const isCommentOwner = loggedInUser && comment.author && comment.author.id === loggedInUser.id;
                        const canDeleteComment = isPostOwner || isCommentOwner || isAdmin; 

                        return (
                            <div key={comment.id} className={styles.comment}>
                                <Avatar src={getAvatarSrc(comment.author.photoUrl)} alt="Comment Author Avatar" className={styles.commentAvatar} />
                                <div className={styles.commentBody}>
                                    <span className={styles.commentUser}>{comment.author.name}</span>
                                    <p className={styles.commentText}>{comment.comment}</p>
                                    {canDeleteComment && (
                                        <button className={styles.deleteCommentBtn} onClick={() => handleDeleteCommentLocal(comment.id)} title="Delete Comment"><FiTrash size={12} /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
