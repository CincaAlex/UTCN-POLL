import React, { useState, useRef, useContext } from 'react';
import styles from './PostCard.module.css';
import { FiMessageSquare, FiShare2, FiEdit, FiUser } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Modal from '../../components/Modal/Modal';
import { UserContext } from '../../context/UserContext';

const PostCard = ({ post, onUpdatePost, currentUsername }) => {
    const { id, user: postUser, time, title, body, isEdited, comments: initialComments, likedBy, counts: initialCounts } = post;
    const { user } = useContext(UserContext);

    // State for UI interaction
    const [isShareIconsVisible, setShareIconsVisible] = useState(false);
    const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
    const [isLikesModalOpen, setLikesModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedBody, setEditedBody] = useState(body);

    // State for data
    const [comments, setComments] = useState(initialComments);
    const [counts, setCounts] = useState({
        ...initialCounts,
        likes: likedBy ? likedBy.length : 0
    });
    const [newComment, setNewComment] = useState('');
    const [currentLikedBy, setCurrentLikedBy] = useState(likedBy); // State for the actual list of users who liked
    const [isLiked, setIsLiked] = useState(likedBy.some(likeUser => likeUser.name === currentUsername));

    // Poll State
    const [pollOptions, setPollOptions] = useState(post.options || []);
    const [hasVoted, setHasVoted] = useState(post.hasVoted || false);

    const shareTimeoutRef = useRef(null);

    const handleVote = (optionId) => {
        if (hasVoted) return;

        const updatedOptions = pollOptions.map(opt => {
            if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
        });

        setPollOptions(updatedOptions);
        setHasVoted(true);
    };

    const getTotalVotes = () => {
        return pollOptions.reduce((acc, curr) => acc + curr.votes, 0);
    };

    const getVotePercentage = (votes) => {
        const total = getTotalVotes();
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    const handleLike = () => {
        if (isLiked) {
            setIsLiked(false);
            setCounts(prev => ({ ...prev, likes: prev.likes - 1 }));
            setCurrentLikedBy(prev => prev.filter(u => u.name !== currentUsername));
        } else {
            setIsLiked(true);
            setCounts(prev => ({ ...prev, likes: prev.likes + 1 }));
            setCurrentLikedBy(prev => [...prev, { name: currentUsername, avatar: user?.photoUrl }]); // Use user's photoUrl
        }
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
            user: { name: currentUsername, avatar: user?.photoUrl }, // Use user's photoUrl
            text: newComment,
        };
        setComments(prev => [...prev, commentToAdd]);
        setCounts(prev => ({ ...prev, comments: prev.comments + 1 }));
        setNewComment('');
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
        onUpdatePost(id, editedTitle, editedBody);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedTitle(title);
        setEditedBody(body);
    };

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

    return (
        <>
            <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="Likes">
                <div className={styles.userList}>
                    {currentLikedBy.map((likeUser, index) => (
                        <div key={index} className={styles.userListItem}>
                            <Avatar 
                                src={getAvatarSrc(likeUser.avatar, likeUser.name === user?.username)} 
                                alt="User Avatar" 
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
                    {!isEditing && postUser.name === currentUsername && (
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
                            
                            {post.type === 'poll' && (
                                <div className={styles.pollContainer}>
                                    {pollOptions.map((option) => {
                                        const percentage = getVotePercentage(option.votes);
                                        return (
                                            <div 
                                                key={option.id} 
                                                className={`${styles.pollOption} ${hasVoted ? styles.voted : ''}`}
                                                onClick={() => handleVote(option.id)}
                                            >
                                                {hasVoted && (
                                                    <div 
                                                        className={styles.pollProgressBar} 
                                                        style={{ width: `${percentage}%` }} 
                                                    />
                                                )}
                                                <div className={styles.pollOptionContent}>
                                                    <span className={styles.pollOptionText}>{option.text}</span>
                                                    {hasVoted && (
                                                        <span className={styles.pollOptionPercentage}>{percentage}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasVoted && <div className={styles.totalVotes}>{getTotalVotes()} votes</div>}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.postStats}>
                    <span onClick={() => currentLikedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
                    <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
                    <span>{counts.shares} Shares</span>
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

                <div className={`${styles.commentSection} ${isCommentSectionVisible ? styles.visible : ''}`}>
                    <form onSubmit={handleAddComment} className={styles.commentForm}>
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className={styles.commentInput}
                        />
                        <button type="submit" className={`${styles.commentPostButtonBase} ${newComment.trim() === '' ? styles.disabledPostButton : styles.commentPostButtonEnabled}`}>Post</button>
                    </form>
                    <div className={styles.commentList}>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.comment}>
                                <Avatar 
                                    src={getAvatarSrc(comment.user.avatar, comment.user.name === user?.username)} 
                                    alt="User Avatar" 
                                    className={styles.commentAvatar} 
                                />
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