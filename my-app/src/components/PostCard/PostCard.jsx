import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import styles from './PostCard.module.css';
import {
  FiMessageSquare, FiShare2, FiEdit2, FiTrash2, FiUser,
  FiCheck, FiX, FiTrash, FiClipboard
} from 'react-icons/fi';
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
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return timeString;
  }
};

const DEFAULT_AVATAR = "/default-avatar.png";

// ---- helpers pentru likedBy (acceptă id-uri sau User objects) ----
const toUserId = (x) => {
  if (x == null) return null;
  if (typeof x === 'number') return x;
  if (typeof x === 'string') {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof x === 'object') {
    const n = Number(x.id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const toUserDisplay = (x) => {
  if (x == null) return null;
  if (typeof x === 'object') {
    return {
      id: toUserId(x),
      name: x.name ?? (x.id != null ? `User ID: ${x.id}` : 'Unknown user'),
      photoUrl: x.photoUrl ?? null,
    };
  }
  // id simplu
  const id = toUserId(x);
  return { id, name: id != null ? `User ID: ${id}` : 'Unknown user', photoUrl: null };
};

const PostCard = ({ post, onUpdatePost, onDeletePost, onDeleteComment, onToggleLike }) => {
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

  const isPostOwner = !!(loggedInUser && author?.id && Number(author.id) === Number(loggedInUser.id));
  const isAdmin = loggedInUser?.role === 'ADMIN';
  const canManagePost = isPostOwner || isAdmin;

  const [isShareVisible, setShareVisible] = useState(false);
  const [isCommentSectionVisible, setCommentSectionVisible] = useState(false);
  const [isLikesModalOpen, setLikesModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedBody, setEditedBody] = useState(content);

  // override local doar când user interacționează
  const [localComments, setLocalComments] = useState(null); // null => folosim ce vine din post
  const [localLikedByIds, setLocalLikedByIds] = useState(null); // null => folosim ce vine din post

  const comments = localComments ?? (Array.isArray(post?.comments) ? post.comments : []);

  // likedBy poate fi ids sau user objects -> îl convertim în ids
  const baseLikedBy = Array.isArray(post?.likedBy) ? post.likedBy : [];
  const baseLikedByIds = useMemo(
    () => baseLikedBy.map(toUserId).filter((v) => v != null),
    [baseLikedBy]
  );

  const currentLikedByIds = localLikedByIds ?? baseLikedByIds;

  // user.id poate fi string -> normalizează
  const myUserId = Number(user?.id);
  const hasMyUserId = Number.isFinite(myUserId);

  const isLiked = hasMyUserId && currentLikedByIds.includes(myUserId);

  const counts = {
    likes: currentLikedByIds.length,
    comments: comments.length,
  };

  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const shareContainerRef = useRef(null);

  // sincronizează doar câmpurile de edit
  useEffect(() => {
    setEditedTitle(prev => (prev === title ? prev : title));
    setEditedBody(prev => (prev === content ? prev : content));
  }, [title, content]);

  // reset override local când se schimbă post-ul (sau când primim update din parent)
  useEffect(() => {
    console.log('🔄 [POSTCARD] Reset triggered for post ID:', id);
    console.log('🔄 [POSTCARD] post.likedBy:', post?.likedBy);
    console.log('🔄 [POSTCARD] baseLikedByIds:', baseLikedByIds);
    setLocalComments(null);
    setLocalLikedByIds(null);
  }, [id, post?.likedBy, baseLikedByIds]);

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
    console.log('🔵 [LIKE] Starting like toggle...');
    console.log('🔵 [LIKE] Token exists:', !!token);
    console.log('🔵 [LIKE] Post ID:', id);
    console.log('🔵 [LIKE] My User ID:', myUserId);
    console.log('🔵 [LIKE] Has My User ID:', hasMyUserId);
    
    if (!token || !id || !hasMyUserId) {
      console.log('🔴 [LIKE] Missing required data, aborting');
      return;
    }

    try {
      console.log('🔵 [LIKE] Sending request to /api/posts/' + id + '/like');
      
      // ✅ Optimistic update pentru UI instant
      const newLikedByIds = baseLikedByIds.includes(myUserId)
        ? baseLikedByIds.filter(uid => uid !== myUserId)
        : [...baseLikedByIds, myUserId];
      
      console.log('🟢 [LIKE] Optimistic - Base:', baseLikedByIds);
      console.log('🟢 [LIKE] Optimistic - New:', newLikedByIds);
      
      setLocalLikedByIds(newLikedByIds);
      
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔵 [LIKE] Response status:', response.status);

      if (!response.ok) {
        console.error('🔴 [LIKE] Failed to toggle like, status:', response.status);
        const errorText = await response.text();
        console.error('🔴 [LIKE] Error response:', errorText);
        // Rollback
        setLocalLikedByIds(baseLikedByIds);
        return;
      }

      // ✅ Backend returnează post-ul complet cu likedBy
      const updatedPost = await response.json();
      console.log('🟢 [LIKE] Updated post from backend:', updatedPost);
      console.log('🟢 [LIKE] Updated likedBy from backend:', updatedPost?.likedBy);

      // ✅ Notifică Homepage să actualizeze state-ul global
      if (onToggleLike && updatedPost?.likedBy !== undefined) {
        console.log('🟢 [LIKE] Calling onToggleLike with likedBy:', updatedPost.likedBy);
        onToggleLike(id, updatedPost.likedBy);
      } else {
        console.warn('⚠️ [LIKE] onToggleLike NOT called - missing data');
      }
    } catch (error) {
      console.error('🔴 [LIKE] Error toggling like:', error);
      // Rollback
      setLocalLikedByIds(baseLikedByIds);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user || !token || !id || newComment.trim() === '') return;

    console.log('💬 [COMMENT] Adding comment...');
    console.log('💬 [COMMENT] Post ID:', id);
    console.log('💬 [COMMENT] Comment text:', newComment.trim());

    try {
      const requestBody = {
        comment: newComment.trim(),
      };

      console.log('💬 [COMMENT] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('💬 [COMMENT] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('💬 [COMMENT] Error response:', errorText);
        console.error('Failed to add comment');
        return;
      }

      const addedComment = await response.json();
      console.log('💬 [COMMENT] Added comment from backend:', addedComment);

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

  // likes pentru modal: dacă backend trimite user objects, le afișăm numele; dacă nu, afișăm id-uri
  const likedByForModal = useMemo(() => {
    if (!Array.isArray(post?.likedBy)) return [];
    const list = post.likedBy.map(toUserDisplay).filter(Boolean);
    // fallback dacă nu avem user objects
    if (list.length === 0) return currentLikedByIds.map(id => ({ id, name: `User ID: ${id}` }));
    return list;
  }, [post?.likedBy, currentLikedByIds]);

  return (
    <div id={`scroll-${id}`} className={styles.postCard}>
      {/* Likes Modal */}
      <Modal isOpen={isLikesModalOpen} onClose={() => setLikesModalOpen(false)} title="People Who Liked This">
        <div className={styles.userList}>
          {likedByForModal.map((u) => (
            <div key={u.id ?? u.name} className={styles.userListItem}>
              <FiUser className={styles.avatar} />
              <span style={{ marginLeft: '0.75rem' }}>{u.name}</span>
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
        <span onClick={() => counts.likes > 0 && setLikesModalOpen(true)}>{counts.likes} Likes</span>
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
            const isCommentOwner = !!(loggedInUser && commentAuthor?.id && Number(commentAuthor.id) === Number(loggedInUser.id));
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