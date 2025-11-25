import React, { useState, useRef } from 'react';
import styles from './PostCard.module.css';
import { FiHeart, FiMessageSquare, FiShare2, FiEdit } from 'react-icons/fi'; // Added FiEdit
import { FaGrin, FaSadTear, FaAngry, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Modal from '../../components/Modal/Modal';

const PostCard = ({ post, onUpdatePost, currentUsername }) => { // Accept onUpdatePost and currentUsername props
    const { id, user, time, title, body, isEdited, comments: initialComments, likedBy, counts: initialCounts } = post; // Destructure isEdited


    
    // State for UI interaction
    const [isReactionsVisible, setReactionsVisible] = useState(false);
    const [isShareIconsVisible, setShareIconsVisible] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
    const [isLikesModalOpen, setLikesModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // New state for edit mode
    const [editedTitle, setEditedTitle] = useState(title); // State for edited title
    const [editedBody, setEditedBody] = useState(body); // State for edited body

    // State for data
    const [comments, setComments] = useState(initialComments);
    const [counts, setCounts] = useState(initialCounts);
    const [newComment, setNewComment] = useState('');

    const reactionTimeoutRef = useRef(null);
    const shareTimeoutRef = useRef(null);

    const handleReaction = (reactionType) => {
        const oldReaction = selectedReaction;
        if (oldReaction === reactionType) {
            setSelectedReaction(null);
            setCounts(prev => ({ ...prev, likes: prev.likes - 1 }));
        } else {
            setSelectedReaction(reactionType);
            if (oldReaction === null) {
                setCounts(prev => ({ ...prev, likes: prev.likes + 1 }));
            }
        }
        setReactionsVisible(false);
    };

    const handleShare = (platform) => {
        console.log(`share to ${platform}:`, id);
        setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
        setShareIconsVisible(false);
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (newComment.trim() === '') return;
        const commentToAdd = {
            user: { name: 'u/current_user', avatar: 'https://i.pravatar.cc/24?u=current_user' },
            text: newComment,
        };
        setComments(prev => [...prev, commentToAdd]);
        setCounts(prev => ({ ...prev, comments: prev.comments + 1 }));
        setNewComment('');
    };

    const handleReactionMouseEnter = () => {
        if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
        setReactionsVisible(true);
    };

    const handleReactionMouseLeave = () => {
        reactionTimeoutRef.current = setTimeout(() => setReactionsVisible(false), 200);
    };

    const handleShareMouseEnter = () => {
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        setShareIconsVisible(true);
    };

    const handleShareMouseLeave = () => {
        shareTimeoutRef.current = setTimeout(() => setShareIconsVisible(false), 200);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        onUpdatePost(id, editedTitle, editedBody); // Call onUpdatePost with id, new title, new body
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedTitle(title); // Revert to original title
        setEditedBody(body);   // Revert to original body
    };

    const ReactionDisplay = () => {
        switch (selectedReaction) {
            case 'like': return <><AiFillLike className={styles.likeIcon} /> Like</>;
            case 'heart': return <><FiHeart className={styles.heartIcon} /> Love</>;
            case 'haha': return <><FaGrin className={styles.hahaIcon} /> Haha</>;
            case 'sad': return <><FaSadTear className={styles.sadIcon} /> Sad</>;
            case 'angry': return <><FaAngry className={styles.angryIcon} /> Angry</>;
            default: return <><AiOutlineLike /> Like</>;
        }
    };

    return (
        <>
            <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="Likes">
                <div className={styles.userList}>
                    {likedBy.map((likeUser, index) => (
                        <div key={index} className={styles.userListItem}>
                            <img src={likeUser.avatar} alt="User Avatar" />
                            <span>{likeUser.name}</span>
                        </div>
                    ))}
                </div>
            </Modal>

            <div className={styles.postCard}>
                <div className={styles.postHeader}>
                    <img src={user.avatar} alt="User Avatar" className={styles.avatar} />
                    <span className={styles.username}>{user.name}</span>
                    <span className={styles.postTime}>⋅ {time} {isEdited && <span className={styles.editedIndicator}>(edited)</span>}</span> {/* Conditionally render (edited) */}
                    {/* Only show edit button if current user is the author and not already editing */}
                    {!isEditing && user.name === currentUsername && (
                        <button onClick={handleEditClick} className={styles.editButton}>
                            <FiEdit /> Edit
                        </button>
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
                    <span onClick={() => likedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
                    <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
                    <span>{counts.shares} Shares</span>
                </div>

                <div className={styles.postFooter}>
                    <div 
                        className={styles.reactionsContainer}
                        onMouseEnter={handleReactionMouseEnter}
                        onMouseLeave={handleReactionMouseLeave}
                    >
                        {isReactionsVisible && (
                            <div className={styles.reactionsPicker}>
                                <button onClick={() => handleReaction('like')} aria-label="Like"><AiFillLike className={styles.likeIcon} /></button>
                                <button onClick={() => handleReaction('heart')} aria-label="Heart"><FiHeart className={styles.heartIcon} /></button>
                                <button onClick={() => handleReaction('haha')} aria-label="Haha"><FaGrin className={styles.hahaIcon} /></button>
                                <button onClick={() => handleReaction('sad')} aria-label="Sad"><FaSadTear className={styles.sadIcon} /></button>
                                <button onClick={() => handleReaction('angry')} aria-label="Angry"><FaAngry className={styles.angryIcon} /></button>
                            </div>
                        )}
                        <button className={styles.likeButton} onClick={() => handleReaction(selectedReaction || 'like')}>
                            <ReactionDisplay />
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

                <div className={`${styles.commentSection} ${isCommentSectionVisible ? styles.visible : ''}`}>
                    <form onSubmit={handleAddComment} className={styles.commentForm}>
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className={styles.commentInput}
                        />
                        <button type="submit">Post</button>
                    </form>
                    <div className={styles.commentList}>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.comment}>
                                <img src={comment.user.avatar} alt="User Avatar" className={styles.commentAvatar} />
                                <div className={styles.commentBody}>
                                    <span className={styles.commentUser}>{comment.user.name}</span>
                                    <p className={styles.commentText}>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostCard;
