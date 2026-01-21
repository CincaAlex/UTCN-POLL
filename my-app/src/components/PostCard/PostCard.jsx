import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import styles from './PostCard.module.css';
import { FiMessageSquare, FiShare2, FiEdit2, FiTrash2, FiUser, FiCheck, FiX, FiTrash, FiClipboard } from 'react-icons/fi';
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Modal from '../../components/Modal/Modal';
import { UserContext } from '../../context/UserContext';

// Utility to format Date objects as relative time
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

const DEFAULT_AVATAR = "/default-avatar.png"; // pune fișierul în public/

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment }) => {
  const { user, token } = useContext(UserContext);

  // normalize content: acceptă și post.body dacă mai există în date vechi
  const content = useMemo(() => (post?.content ?? post?.body ?? ""), [post?.content, post?.body]);

  const id = post?.id;
  const createdAt = post?.createdAt;
  const title = post?.title ?? "";
  const isEdited = !!post?.isEdited;

  const rawAuthor = post?.author;
  const author = rawAuthor ?? { id: null, name: "Unknown user", photoUrl: null };

  const loggedInUser = user
    ? { id: user.id, name: user.name, role: user.userType, photoUrl: user.photoUrl }
    : null;

  const isPostOwner = !!(loggedInUser && author?.id && author.id === loggedInUser.id);
  const isAdmin = loggedInUser?.role === 'ADMIN';
  const canManagePost = isPostOwner || isAdmin;

  const [isShareVisible, setShareVisible] = useState(false);
  const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
  const [isLikesModalOpen, setLikesModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedBody, setEditedBody] = useState(content);

  // ✅ IMPORTANT: nu mai sincroniza comments/likedBy cu useEffect (asta îți făcea loop).
  // Ținem override local doar când user interacționează.
  const [localComments, setLocalComments] = useState(null); // null => folosim ce vine din post
  const [localLikedBy, setLocalLikedBy] = useState(null);   // null => folosim ce vine din post

  const comments = localComments ?? (Array.isArray(post?.comments) ? post.comments : []);
  const currentLikedBy = localLikedBy ?? (Array.isArray(post?.likedBy) ? post.likedBy : []);

  const isLiked = !!(user && currentLikedBy.includes(user.id));

  const counts = {
    likes: currentLikedBy.length,
    comments: comments.length,
  };

  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const shareContainerRef = useRef(null);

  // ✅ când se schimbă post (după fetch), sincronizează doar câmpurile de edit
  // (cu guard ca să evităm setState inutil)
  useEffect(() => {
    setEditedTitle(prev => (prev === title ? prev : title));
    setEditedBody(prev => (prev === content ? prev : content));
  }, [title, content]);

  // dacă user navighează între posturi / se reîncarcă lista,
  // resetăm override local ca să reflecte ce vine din server
  useEffect(() => {
    setLocalComments(null);
    setLocalLikedBy(null);
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isShareVisible && shareContainerRef.current && !shareContainerRef.current.contains(event.target)) {
        setShareVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShareVisible]);

  const getAvatarSrc = (avatarUrl) => avatarUrl || DEFAULT_AVATAR;

  const handleLike = async () => {
    if (!user || !token || !id) return;

    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user), // pe termen lung: ideal scoți user din body și iei din JWT
      });

      if (!response.ok) {
        console.error('Failed to toggle like');
        return;
      }

      setLocalLikedBy(prev => {
        const base = prev ?? (Array.isArray(post?.likedBy) ? post.likedBy : []);
        if (base.includes(user.id)) {
          return base.filter(uid => uid !== user.id);
        }
        return [...base, user.id];
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user || !token || !id || newComment.trim() === '') return;

    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          author: user, // pe termen lung: ideal scoți author din body și iei din JWT
          comment: newComment.trim(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to add comment');
        return;
      }

      // dacă backend-ul îți returnează comment-ul creat, asta merge direct.
      const addedComment = await response.json();

      setLocalComments(prev => {
        const base = prev ?? (Array.isArray(post?.comments) ? post.comments : []);
        return [...base, addedComment];
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteCommentLocal = (commentId) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDeleteComment(id, commentId);

      setLocalComments(prev => {
        const base = prev ?? (Array.isArray(post?.comments) ? post.comments : []);
        return base.filter(c => c.id !== commentId);
      });
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    if (!id) return;
    onUpdatePost(id, editedTitle, editedBody);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedTitle(title);
    setEditedBody(content);
  };

  const handleDeletePostLocal = () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this post?")) onDeletePost(id);
  };

  const Avatar = ({ src, alt, className }) => {
    const [hasError, setHasError] = useState(false);
    if (!src || hasError) return <FiUser className={className} />;
    return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
  };

  const postLink = `${window.location.origin}${window.location.pathname}#post-${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div id={`scroll-${id}`} className={styles.postCard}>
      {/* Likes Modal */}
      <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="People Who Liked This">
        <div className={styles.userList}>
          {currentLikedBy.map((userId) => (
            <div key={userId} className={styles.userListItem}>
              <FiUser className={styles.avatar} />
              <span style={{ marginLeft: '0.75rem' }}>User ID: {userId}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Post Header */}
      <div className={styles.postHeader}>
        <Avatar src={getAvatarSrc(author.photoUrl)} alt="Author Avatar" className={styles.avatar} />
        <span className={styles.username}>{author.name || "Unknown user"}</span>

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
                {isPostOwner && (
                  <button className={styles.postActionButton} onClick={handleEditClick} title="Edit Post"><FiEdit2 /></button>
                )}
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
            <p className={styles.postBody}>{content}</p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className={styles.postStats}>
        <span onClick={() => currentLikedBy.length > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
        <span onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>{counts.comments} Comments</span>
        <span>{post?.shares || 0} Shares</span>
      </div>

      {/* Footer */}
      <div className={styles.postFooter}>
        <div className={styles.reactionsContainer}>
          <button className={`${styles.likeButton} ${isLiked ? styles.active : ''}`} onClick={handleLike}>
            {isLiked ? <AiFillLike className={styles.likeIcon} /> : <AiOutlineLike />} Like
          </button>
        </div>

        <div className={styles.actionButtons}>
          <button onClick={() => setCommentSectionVisible(!isCommentSectionVisible)}>
            <FiMessageSquare /> Comments
          </button>

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
          {comments.map((comment) => {
            const commentAuthor = comment?.author ?? { id: null, name: "Unknown user", photoUrl: null };
            const isCommentOwner = !!(loggedInUser && commentAuthor?.id && commentAuthor.id === loggedInUser.id);
            const canDeleteComment = isPostOwner || isCommentOwner || isAdmin;

            return (
              <div key={comment.id} className={styles.comment}>
                <Avatar src={getAvatarSrc(commentAuthor.photoUrl)} alt="Comment Author Avatar" className={styles.commentAvatar} />
                <div className={styles.commentBody}>
                  <span className={styles.commentUser}>{commentAuthor.name || "Unknown user"}</span>
                  <p className={styles.commentText}>{comment.comment}</p>
                  {canDeleteComment && (
                    <button
                      className={styles.deleteCommentBtn}
                      onClick={() => handleDeleteCommentLocal(comment.id)}
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
  );
};

export default PostCard;
