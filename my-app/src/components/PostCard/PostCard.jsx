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
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    } catch {
        return timeString;
    }
};

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment, currentUser }) => {
    
    const { id, user: postUser, time, title, body, isEdited, comments: initialComments, likedBy, counts: initialCounts } = post;
    const { user } = useContext(UserContext);
    const currentUsername = user?.username; 
    
    const loggedInUser = user ? { 
        nameIdentifier: user.username, 
        role: user.role, 
        photoUrl: user.photoUrl 
    } : null;
    
    const isPostOwner = loggedInUser && postUser && postUser.name === loggedInUser.nameIdentifier;
    const isAdmin = loggedInUser && loggedInUser.role === 'admin';
    const canManagePost = isPostOwner || isAdmin; 

    const [isShareVisible, setShareVisible] = useState(false);
    const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
    const [isLikesModalOpen, setLikesModalOpen] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedBody, setEditedBody] = useState(body);

    const [comments, setComments] = useState(initialComments);
    const [counts, setCounts] = useState({
        ...initialCounts,
        likes: likedBy ? likedBy.length : 0,
        comments: initialComments ? initialComments.length : 0,
    });
    const [newComment, setNewComment] = useState('');
    const [currentLikedBy, setCurrentLikedBy] = useState(likedBy);
    const [isLiked, setIsLiked] = useState(likedBy.some(likeUser => likeUser.name === currentUsername)); 

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

    const handleLike = () => {
        if (!user) return; 
        if (isLiked) {
            setIsLiked(false);
            setCounts(prev => ({ ...prev, likes: prev.likes - 1 }));
            setCurrentLikedBy(prev => prev.filter(u => u.name !== currentUsername));
        } else {
            setIsLiked(true);
            setCounts(prev => ({ ...prev, likes: prev.likes + 1 }));
            setCurrentLikedBy(prev => [...prev, { name: currentUsername, avatar: user.photoUrl }]); 
        }
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!user || newComment.trim() === '') return;
        
        const commentToAdd = {
            user: { 
                name: currentUsername, 
                avatar: user.photoUrl 
            }, 
            text: newComment.trim(),
        };
        
        setComments(prev => [...prev, commentToAdd]);
        setCounts(prev => ({ ...prev, comments: prev.comments + 1 }));
        setNewComment('');
    };

    const handleDeleteComment = (commentIndex) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            setComments(prev => prev.filter((_, index) => index !== commentIndex));
            setCounts(prev => ({ ...prev, comments: prev.comments - 1 }));
            onDeleteComment(id, commentIndex); 
        }
    };

    const handleEditClick = () => setIsEditing(true);
    const handleSaveClick = () => { onUpdatePost(id, editedTitle, editedBody); setIsEditing(false); };
    const handleCancelClick = () => { setIsEditing(false); setEditedTitle(title); setEditedBody(body); };
    const handleDeletePost = () => { if(window.confirm("Are you sure you want to delete this post?")) onDeletePost(id); };

    const Avatar = ({ src, alt, className }) => {
        const [hasError, setHasError] = useState(false);
        if (!src || hasError) return <FiUser className={className} />;
        return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
    };

    const getAvatarSrc = (avatarUrl, isCurrentUser) => user?.photoUrl && isCurrentUser ? user.photoUrl : avatarUrl;

    const postLink = `${window.location.origin}${window.location.pathname}#post-${id}`;
    
    const handleCopyLink = () => {
        // Use the current path to ensure we link to the right view before the hash
        navigator.clipboard.writeText(postLink);
        setCopied(true);
        
        // Hide the copy confirmation after 1.5s, and close the share window 0.5s later
        
    };

    return (
        <div key={post.id} id={`scroll-${post.id}`} className={styles.postCard}>
            {/* Likes Modal (Unchanged) */}
            <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="People Who Liked This">
                <div className={styles.userList}>
                    {currentLikedBy.map((likeUser, index) => (
                        <div key={index} className={styles.userListItem}>
                            <Avatar src={getAvatarSrc(likeUser.avatar, likeUser.name === user?.username)} alt="User Avatar" className={styles.avatar} />
                            <span style={{marginLeft: '0.75rem'}}>{likeUser.name}</span>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Post Header (Unchanged) */}
            <div className={styles.postHeader}>
                <Avatar src={getAvatarSrc(postUser.avatar, postUser.name === user?.username)} alt="User Avatar" className={styles.avatar} />
                <span className={styles.username}>{postUser.name}</span>
                <span className={styles.postTime}>
                    ⋅ {formatRelativeTime(time)} {isEdited && <span className={styles.editedIndicator}>(edited)</span>}
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
                                <button className={`${styles.postActionButton} ${styles.delete}`} onClick={handleDeletePost} title="Delete Post"><FiTrash2 /></button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content (Unchanged) */}
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
                        <p className={styles.postBody}>{body}</p>
                    </>
                )}
            </div>

            {/* Stats (Unchanged) */}
            <div className={styles.postStats}>
                <span onClick={() => currentLikedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
                <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
                <span>{counts.shares || 0} Shares</span>
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
                    
                    {/* Share Container with Ref for click outside logic */}
                    <div className={styles.shareContainer} ref={shareContainerRef}>
                        <button onClick={() => setShareVisible(!isShareVisible)}><FiShare2 /> Share</button>
                        {isShareVisible && (
                            <div className={styles.shareWindow}>
                                {/* Display the complete routeable link */}
                                <input type="text" readOnly value={postLink} />
                                <button onClick={handleCopyLink}>
                                    <FiClipboard /> {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comment Section (Unchanged) */}
            <div className={`${styles.commentSection} ${isCommentSectionVisible ? styles.visible : ''}`}>
                <form onSubmit={handleAddComment} className={styles.commentForm}>
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className={styles.commentInput} />
                    <button type="submit" className={`${styles.commentPostButtonBase} ${newComment.trim() === '' ? styles.disabledPostButton : styles.commentPostButtonEnabled}`} disabled={newComment.trim() === ''}>Post</button>
                </form>
                <div className={styles.commentList}>
                    {comments.map((comment, index) => {
                        const isCommentOwner = loggedInUser && comment.user && comment.user.name === loggedInUser.nameIdentifier;
                        const canDeleteComment = isPostOwner || isCommentOwner || isAdmin; 

                        return (
                            <div key={index} className={styles.comment}>
                                <Avatar src={getAvatarSrc(comment.user.avatar, comment.user.name === user?.username)} alt="User Avatar" className={styles.commentAvatar} />
                                <div className={styles.commentBody}>
                                    <span className={styles.commentUser}>{comment.user.name}</span>
                                    <p className={styles.commentText}>{comment.text}</p>
                                    {canDeleteComment && (
                                        <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(index)} title="Delete Comment"><FiTrash size={12} /></button>
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