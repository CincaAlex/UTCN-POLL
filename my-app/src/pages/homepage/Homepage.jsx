import React, { useState, useContext, useLayoutEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import Feed from './Feed';
import styles from './Homepage.module.css';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useNavigate } from 'react-router-dom';
// Importăm componenta independentă
import PostAccessAuth from '../../components/PostAccessAuth/PostAccessAuth';

// --- MOCK DATA ---
const initialHomepagePosts = [
    {
        id: 1,
        user: { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' },
        time: new Date(new Date().getTime() - 3 * 3600 * 1000),
        title: 'Welcome to UTCNHub!',
        body: 'Just wanted to say this new UTCNHub platform looks amazing...',
        counts: { likes: 25, comments: 3, shares: 2 },
        comments: [
            { user: { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' }, text: 'I agree, it looks great!' },
            { user: { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' }, text: "Can't wait to see the new features." },
            { user: { name: 'HighRoller_777', avatar: 'https://i.pravatar.cc/24?u=HighRoller_777' }, text: "This is my comment on someone else's post." },
        ],
        likedBy: []
    },
    {
        id: 2,
        user: { name: 'Secretariat AC', avatar: 'https://i.pravatar.cc/24?u=secretariat' },
        time: new Date(new Date().getTime() - 5 * 3600 * 1000),
        title: 'Upcoming Exam Session Schedule',
        body: 'Heads up to all students! The preliminary exam session schedule has been posted on Moodle...',
        counts: { likes: 45, comments: 1, shares: 10 },
        comments: [
            { user: { name: 'HighRoller_777', avatar: 'https://i.pravatar.cc/24?u=HighRoller_777' }, text: "This is my comment on the admin's post." },
        ],
        likedBy: []
    }
];

const Homepage = () => {
    const { theme } = useTheme();
    const { user } = useContext(UserContext);
    const scrollDirection = useScrollDirection();

    const [posts, setPosts] = useState(initialHomepagePosts);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingPostHash, setPendingPostHash] = useState(null);

    const hasCaptured = useRef(false);
    
    const currentUsername = user?.username;

    const navigate = useNavigate();

    // Scroll to a post if hash exists
    const handleScrollToPost = useCallback(() => {
        const hash = window.location.hash; // ex: #post-1
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

    useLayoutEffect(() => {
        if (hasCaptured.current) return;

        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            hasCaptured.current = true;
            setPendingPostHash(hash);

            // ȘTERGEM hash-ul din URL IMEDIAT. 
            // Aceasta este singura cale de a opri browserul sau alte componente să-l vadă.
            window.history.replaceState(null, '', window.location.pathname);

            if (!user) {
                setIsLoginModalOpen(true);
            }
        }
    }, [user]);
    // --- Modal Handlers ---
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        if (pendingPostHash) {
            window.location.hash = pendingPostHash;
            handleScrollToPost();
            setPendingPostHash(null);
        }
    };

    const handleLoginModalClose = () => {
        setIsLoginModalOpen(false);
        if (pendingPostHash) {
            // Deoarece am salvat hash-ul în pendingPostHash, 
            // redirecționarea va funcționa chiar dacă URL-ul actual e curat.
            navigate('/access-denied', { replace: true });
            setPendingPostHash(null);
        }
    };

    // --- Post CRUD handlers ---
    const handleCreatePost = (newTitle, newBody) => {
        const newPost = {
            id: Date.now(),
            user: { name: currentUsername, avatar: user?.photoUrl || 'https://i.pravatar.cc/40' },
            time: new Date(),
            title: newTitle,
            body: newBody,
            counts: { likes: 0, comments: 0, shares: 0 },
            comments: [],
            likedBy: [],
            type: 'text'
        };
        setPosts([newPost, ...posts]);
    };

    const handleUpdatePost = (id, newTitle, newBody) => {
        setPosts(prev => prev.map(post => post.id === id ? { ...post, title: newTitle, body: newBody, isEdited: true } : post));
    };

    const handleDeletePost = (id) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setPosts(prev => prev.filter(post => post.id !== id));
        }
    };

    const handleDeleteComment = (postId, commentIndex) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const updatedComments = post.comments.filter((_, index) => index !== commentIndex);
                return { ...post, comments: updatedComments, counts: { ...post.counts, comments: updatedComments.length } };
            }
            return post;
        }));
    };

    // --- Sorting & Search ---
    const handleSortChange = (newSortOrder) => setSortOrder(newSortOrder);
    const handleSearchTermChange = (newSearchTerm) => setSearchTerm(newSearchTerm);

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        switch (sortOrder) {
            case 'oldest': return a.time - b.time;
            case 'newest': return b.time - a.time;
            case 'top': return b.counts.likes - a.counts.likes;
            default: return 0;
        }
    });

    return (
        <div className={`${styles.homepage} ${styles[theme]}`}>
            {/* Folosim direct componenta independentă în loc de LoginModal */}
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
                suggestions={[]}
            />
            <main className={styles.mainContainer}>
                <CreatePost onCreatePost={handleCreatePost} />
                <Feed 
                    posts={sortedPosts} 
                    onUpdatePost={handleUpdatePost} 
                    onDeletePost={handleDeletePost} 
                    onDeleteComment={handleDeleteComment} 
                    currentUser={currentUsername} 
                />
            </main>
        </div>
    );
};

export default Homepage;