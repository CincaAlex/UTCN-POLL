import React, { useState, useContext, useLayoutEffect, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useNavigate } from 'react-router-dom';
import PostAccessAuth from '../../components/PostAccessAuth/PostAccessAuth';

const Homepage = () => {
  const { theme } = useTheme();
  const { user, token, loading: userLoading } = useContext(UserContext);
  const scrollDirection = useScrollDirection();

  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingPostHash, setPendingPostHash] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);

  const hasCaptured = useRef(false);
  const navigate = useNavigate();

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      console.log('📥 [HOMEPAGE] Fetching posts...');
      setPostsLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('/api/posts', { headers });

        if (response.ok) {
          const data = await response.json();
          console.log('📥 [HOMEPAGE] Fetched posts count:', data?.length);
          
          if (data && data.length > 0) {
            console.log('📥 [HOMEPAGE] First post:', data[0]);
            console.log('📥 [HOMEPAGE] First post author:', data[0]?.author);
            console.log('📥 [HOMEPAGE] First post likedBy:', data[0]?.likedBy);
            console.log('📥 [HOMEPAGE] First post comments:', data[0]?.comments);
          }

          // normalize: dacă backend returnează content, dar unele posturi vechi au body,
          // păstrăm content ca sursă principală
          const normalized = (Array.isArray(data) ? data : []).map(p => ({
            ...p,
            content: p?.content ?? p?.body ?? '',
          }));

          const sortedData = normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log('📥 [HOMEPAGE] Posts set in state');
          setPosts(sortedData);
        } else {
          const errorText = await response.text();
          console.error('📥 [HOMEPAGE] Failed to fetch posts', response.status);
          console.error('📥 [HOMEPAGE] Error response:', errorText);
          setPosts([]);
        }
      } catch (error) {
        console.error('📥 [HOMEPAGE] Error fetching posts:', error);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    if (!userLoading) fetchPosts();
  }, [userLoading, token]);

  const getSuggestions = () => {
    if (!searchTerm) return [];

    const term = (searchTerm || '').toLowerCase();

    const postSuggestions = posts
      .filter(p => {
        const title = (p?.title ?? '').toLowerCase();
        const content = (p?.content ?? p?.body ?? '').toLowerCase();
        return title.includes(term) || content.includes(term);
      })
      .map(p => ({
        text: p?.title ?? '(fără titlu)',
        type: 'post',
        id: p?.id,
      }));

    return postSuggestions.slice(0, 5);
  };

  // Scroll to a post if hash exists
  const handleScrollToPost = useCallback(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
      if (!user) return;

      const postId = hash.replace('#post-', '');
      const targetId = `#scroll-${postId}`;

      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 800);
    }
  }, [user]);

  // Handle initial load with hash for post
  useLayoutEffect(() => {
    if (hasCaptured.current) return;

    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
      hasCaptured.current = true;
      setPendingPostHash(hash);
      window.history.replaceState(null, '', window.location.pathname);

      // doar dacă NU ai user și NU ai token → modal
      if (!user && !userLoading && !token) {
        setIsLoginModalOpen(true);
      } else if (user && !userLoading) {
        handleScrollToPost();
      }
    }
  }, [user, userLoading, token, handleScrollToPost]);

  // Modal handlers
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (pendingPostHash) {
      window.location.hash = pendingPostHash;
      setPendingPostHash(null);
    }
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    if (pendingPostHash) {
      navigate('/access-denied', { replace: true });
      setPendingPostHash(null);
    }
  };

  // CRUD handlers
  const handleCreatePost = (newPost) => {
    if (!newPost) return;

    // normalize (content)
    const normalized = {
      ...newPost,
      content: newPost?.content ?? newPost?.body ?? '',
    };

    setPosts(prev => [normalized, ...prev]);
  };

  const handleUpdatePost = async (id, newTitle, newContent) => {
    if (!token) {
      console.error('No authentication token found for updating post.');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // backend-ul tău primește String raw => trimiți string, nu obiect
        body: JSON.stringify(newContent),
      });

      if (response.ok) {
        setPosts(prev =>
          prev.map(post =>
            post.id === id
              ? { ...post, title: newTitle, content: newContent, isEdited: true }
              : post
          )
        );
      } else {
        console.error('Failed to update post:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch {
          // ignore json parse
        }
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (id) => {
    if (!token) {
      console.error('No authentication token found for deleting post.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setPosts(prev => prev.filter(post => post.id !== id));
        } else {
          console.error('Failed to delete post:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    console.log('🗑️ [HOMEPAGE] Deleting comment...');
    console.log('🗑️ [HOMEPAGE] Post ID:', postId);
    console.log('🗑️ [HOMEPAGE] Comment ID:', commentId);
    console.log('🗑️ [HOMEPAGE] Token exists:', !!token);
    
    if (!token) {
      console.error('🗑️ [HOMEPAGE] No authentication token found for deleting comment.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        console.log('🗑️ [HOMEPAGE] Sending DELETE request to /api/comments/' + commentId);
        
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('🗑️ [HOMEPAGE] Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('🗑️ [HOMEPAGE] Delete response from backend:', result);
          console.log('🗑️ [HOMEPAGE] Comment deleted successfully, updating local state');
          
          setPosts(prev =>
            prev.map(post => {
              if (post.id === postId) {
                const updatedComments = (post.comments || []).filter(c => c.id !== commentId);
                console.log('🗑️ [HOMEPAGE] Updated comments for post', postId, ':', updatedComments);
                return { ...post, comments: updatedComments };
              }
              return post;
            })
          );
        } else {
          const errorText = await response.text();
          console.error('🗑️ [HOMEPAGE] Failed to delete comment:', response.status, errorText);
        }
      } catch (error) {
        console.error('🗑️ [HOMEPAGE] Error deleting comment:', error);
      }
    }
  };

  // ✅ Like handler - actualizează state-ul după toggle
  const handleToggleLike = async (postId, updatedLikedBy) => {
    console.log('🟡 [HOMEPAGE] handleToggleLike called');
    console.log('🟡 [HOMEPAGE] Post ID:', postId);
    console.log('🟡 [HOMEPAGE] Updated likedBy:', updatedLikedBy);
    
    // updatedLikedBy vine de la PostCard după ce face optimistic update
    setPosts(prev => {
      const updated = prev.map(post =>
        post.id === postId
          ? { ...post, likedBy: updatedLikedBy }
          : post
      );
      
      console.log('🟡 [HOMEPAGE] Posts state updated');
      const updatedPost = updated.find(p => p.id === postId);
      console.log('🟡 [HOMEPAGE] Updated post likedBy:', updatedPost?.likedBy);
      
      return updated;
    });
  };

  // Sorting & search
  const handleSortChange = (newSortOrder) => setSortOrder(newSortOrder);
  const handleSearchTermChange = (newSearchTerm) => setSearchTerm(newSearchTerm);

  const term = (searchTerm || '').toLowerCase();

  const filteredPosts = posts.filter(post => {
    const title = (post?.title ?? '').toLowerCase();
    const content = (post?.content ?? post?.body ?? '').toLowerCase();
    const authorName = (post?.author?.name ?? '').toLowerCase();
    return title.includes(term) || content.includes(term) || authorName.includes(term);
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'top': {
        const aLikes = Array.isArray(a?.likedBy) ? a.likedBy.length : 0;
        const bLikes = Array.isArray(b?.likedBy) ? b.likedBy.length : 0;
        return bLikes - aLikes;
      }
      default:
        return 0;
    }
  });

  if (userLoading || postsLoading) {
    return <div className={styles.loadingContainer}>Loading homepage...</div>;
  }

  return (
    <div className={`${styles.homepage} ${styles[theme]}`}>
      {isLoginModalOpen && (
        <PostAccessAuth
          onAuthSuccess={handleLoginSuccess}
          onCancel={handleLoginModalClose}
        />
      )}

      <TopBar />
      <SearchBar
        isHidden={scrollDirection === 'down'}
        onSortChange={handleSortChange}
        currentSort={sortOrder}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        suggestions={getSuggestions()}
        theme={theme}
      />

      <main className={styles.mainContainer}>
        <CreatePost onCreatePost={handleCreatePost} />
        <Feed
          posts={sortedPosts}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onToggleLike={handleToggleLike}
          currentUser={user}
        />
      </main>
    </div>
  );
};

export default Homepage;