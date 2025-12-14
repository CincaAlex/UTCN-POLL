import React, { useState, useRef, useContext } from 'react';
import styles from './PostCard.module.css';
import { FiMessageSquare, FiShare2, FiEdit2, FiTrash2, FiUser, FiCheck, FiX, FiTrash } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Modal from '../../components/Modal/Modal';
import { UserContext } from '../../context/UserContext';

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment, currentUser }) => {
    
    const { id, user: postUser, time, title, body, isEdited, comments: initialComments, likedBy, counts: initialCounts } = post;
    const { user } = useContext(UserContext);

    const currentUsername = user?.username; 
    
    // Structure the current user data for permission checks
    const loggedInUser = user ? { 
        nameIdentifier: user.username, 
        role: user.role, 
        photoUrl: user.photoUrl 
    } : null;
    
    // Check post ownership (Compare post author name with current user's unique identifier)
    const isPostOwner = loggedInUser && postUser && postUser.name === loggedInUser.nameIdentifier;
    const isAdmin = loggedInUser && loggedInUser.role === 'admin';
    const canManagePost = isPostOwner || isAdmin; 

    // --- STATE FOR UI INTERACTION & DATA ---
    const [isShareIconsVisible, setShareIconsVisible] = useState(false);
    const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
    const [isLikesModalOpen, setLikesModalOpen] = useState(false);
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedBody, setEditedBody] = useState(body);

    // Post Data State
    const [comments, setComments] = useState(initialComments);
    const [counts, setCounts] = useState({
        ...initialCounts,
        likes: likedBy ? likedBy.length : 0,
        comments: initialComments ? initialComments.length : 0,
    });
    const [newComment, setNewComment] = useState('');
    const [currentLikedBy, setCurrentLikedBy] = useState(likedBy);
    // Use the prop 'currentUser' (which is the username string) for the check
    const [isLiked, setIsLiked] = useState(likedBy.some(likeUser => likeUser.name === currentUsername)); 

    const shareTimeoutRef = useRef(null);
    
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

    const handleShare = (platform) => {
        console.log(`Shared post ${id} to ${platform}`);
        setCounts(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
        setShareIconsVisible(false);
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
            
            // 1. Optimistic local state update (Removes comment from view immediately)
            setComments(prev => prev.filter((_, index) => index !== commentIndex));
            setCounts(prev => ({ ...prev, comments: prev.comments - 1 }));
            
            // 2. Delegate deletion to the parent for global state/API update
            onDeleteComment(id, commentIndex); 
        }
    };

    const handleShareMouseEnter = () => { // FIX: DEFINED
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        setShareIconsVisible(true);
    };

    const handleShareMouseLeave = () => { // FIX: DEFINED
        shareTimeoutRef.current = setTimeout(() => setShareIconsVisible(false), 200);
    };

    // --- EDIT HANDLERS ---
    const handleEditClick = () => { // FIX: DEFINED
        setIsEditing(true);
    };

    const handleSaveClick = () => { // FIX: DEFINED
        onUpdatePost(id, editedTitle, editedBody);
        setIsEditing(false);
    };

    const handleCancelClick = () => { // FIX: DEFINED
        setIsEditing(false);
        setEditedTitle(title);
        setEditedBody(body);
    };

    const handleDeletePost = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDeletePost(id); // Delegate deletion to parent
        }
    };
    
    // --- AVATAR LOGIC ---
    const Avatar = ({ src, alt, className }) => {
        const [hasError, setHasError] = useState(false);
        
        if (!src || hasError) {
            return <FiUser className={className} />;
        }
        
        return (
            <img 
                src={src} 
                alt={alt} 
                className={className} 
                onError={() => setHasError(true)} 
            />
        );
    };

    const getAvatarSrc = (avatarUrl, isCurrentUser) => {
        return isCurrentUser && user?.photoUrl ? user.photoUrl : avatarUrl;
    };
    // -----------------------

    return (
        <>
            {/* Likes Modal */}
            <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="People Who Liked This">
                <div className={styles.userList}>
                    {currentLikedBy.map((likeUser, index) => (
                        <div key={index} className={styles.userListItem}>
                            <Avatar 
                                src={getAvatarSrc(likeUser.avatar, likeUser.name === user?.username)} 
                                alt="User Avatar" 
                                className={styles.avatar}
                            />
                            <span style={{marginLeft: '0.75rem'}}>{likeUser.name}</span>
                        </div>
                    ))}
                </div>
            </Modal>

            <div className={styles.postCard}>
                <div className={styles.postHeader}>
                    <Avatar 
                        src={getAvatarSrc(postUser.avatar, postUser.name === user?.username)} 
                        alt="User Avatar" 
                        className={styles.avatar} 
                    />
                    <span className={styles.username}>{postUser.name}</span>
                    <span className={styles.postTime}>⋅ {time} {isEdited && <span className={styles.editedIndicator}>(edited)</span>}</span>
                    
                    {/* POST MANAGEMENT ACTIONS (Edit/Delete) */}
                    {canManagePost && (
                        <div className={styles.postActionsMenu}>
                            {isEditing ? (
                                <>
                                    <button className={styles.postActionButton} onClick={handleSaveClick} title="Save">
                                        <FiCheck />
                                    </button>
                                    <button className={styles.postActionButton} onClick={handleCancelClick} title="Cancel">
                                        <FiX />
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isPostOwner && ( // Only owner can start edit mode
                                        <button className={styles.postActionButton} onClick={handleEditClick} title="Edit Post">
                                            <FiEdit2 />
                                        </button>
                                    )}
                                    {/* Owner or Admin can delete */}
                                    <button className={`${styles.postActionButton} ${styles.delete}`} onClick={handleDeletePost} title="Delete Post">
                                        <FiTrash2 />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                <div className={styles.postContent}>
                    {isEditing ? (
                        <>
                            <input 
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className={styles.editTitleInput}
                            />
                            <textarea
                                value={editedBody}
                                onChange={(e) => setEditedBody(e.target.value)}
                                className={styles.editBodyTextarea}
                            />
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

                <div className={styles.postStats}>
                    <span onClick={() => currentLikedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
                    <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
                    <span>{counts.shares || 0} Shares</span>
                </div>

                <div className={styles.postFooter}>
                    <div className={styles.reactionsContainer}>
                        <button 
                            className={`${styles.likeButton} ${isLiked ? styles.active : ''}`} 
                            onClick={handleLike}
                        >
                            {isLiked ? <AiFillLike className={styles.likeIcon} /> : <AiOutlineLike />} Like
                        </button>
                    </div>
                    <div className={styles.actionButtons}>
                        <button onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>
                            <FiMessageSquare /> Comments
                        </button>
                        <div 
                            className={styles.shareContainer}
                            onMouseEnter={handleShareMouseEnter}
                            onMouseLeave={handleShareMouseLeave}
                        >
                            <button onClick={() => handleShare('default')}>
                                <FiShare2 /> Share
                            </button>
                            {isShareIconsVisible && (
                                <div className={styles.shareIconsPicker}>
                                    <button onClick={() => handleShare('instagram')} aria-label="Share to Instagram"><FaInstagram /></button>
                                    <button onClick={() => handleShare('facebook')} aria-label="Share to Facebook"><FaFacebook /></button>
                                    <button onClick={() => handleShare('twitter')} aria-label="Share to Twitter"><FaTwitter /></button>
                                    <button onClick={() => handleShare('whatsapp')} aria-label="Share to WhatsApp"><FaWhatsapp /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Section & Form */}
                <div className={`${styles.commentSection} ${isCommentSectionVisible ? styles.visible : ''}`}>
                    <form onSubmit={handleAddComment} className={styles.commentForm}>
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className={styles.commentInput}
                        />
                        <button 
                            type="submit" 
                            className={`${styles.commentPostButtonBase} ${newComment.trim() === '' ? styles.disabledPostButton : styles.commentPostButtonEnabled}`}
                            disabled={newComment.trim() === ''}
                        >
                            Post
                        </button>
                    </form>
                    <div className={styles.commentList}>
                        {comments.map((comment, index) => {
                            // Check if the current user's unique username matches the comment author's name field
                            const isCommentOwner = loggedInUser && comment.user && comment.user.name === loggedInUser.nameIdentifier;
                            
                            // Post owner OR Comment Owner OR Admin can delete comment
                            const canDeleteComment = isPostOwner || isCommentOwner || isAdmin; 

                            return (
                                <div key={index} className={styles.comment}>
                                    <Avatar 
                                        src={getAvatarSrc(comment.user.avatar, comment.user.name === user?.username)} 
                                        alt="User Avatar" 
                                        className={styles.commentAvatar} 
                                    />
                                    <div className={styles.commentBody}>
                                        <span className={styles.commentUser}>{comment.user.name}</span>
                                        <p className={styles.commentText}>{comment.text}</p>
                                        
                                        {canDeleteComment && (
                                            <button 
                                                className={styles.deleteCommentBtn} 
                                                onClick={() => handleDeleteComment(index)} 
                                                title="Delete Comment"
                                            >
                                                <FiTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostCard;