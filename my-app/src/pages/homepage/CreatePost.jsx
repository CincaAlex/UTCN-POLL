import React, { useState } from 'react';
import styles from './CreatePost.module.css';
import { FiType, FiBarChart2, FiPlus, FiX } from 'react-icons/fi';

const CreatePost = ({ onCreatePost }) => {
    const [postTitle, setPostTitle] = useState('');
    const [postText, setPostText] = useState('');
    const [postType, setPostType] = useState('text'); // 'text' or 'poll'
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddOption = () => {
        setPollOptions([...pollOptions, '']);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        if (pollOptions.length > 2) {
            const newOptions = pollOptions.filter((_, i) => i !== index);
            setPollOptions(newOptions);
        }
    };

    const handlePost = async () => {
        if (!postTitle.trim() && !postText.trim()) return;

        if (postType === 'poll') {
            const validOptions = pollOptions.filter(opt => opt.trim() !== '');
            if (validOptions.length < 2) {
                setError('Please provide at least two valid options for the poll.');
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const optionsToSubmit = postType === 'poll' ? pollOptions.filter(opt => opt.trim() !== '') : [];
            onCreatePost(postTitle, postText, postType, optionsToSubmit);

            setPostTitle('');
            setPostText('');
            setPollOptions(['', '']);
            setPostType('text'); // Reset to text post
        } catch (err) {
            setError('Failed to post. Please try again.');
            console.error('Error submitting post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.createPostContainer}>
            <div className={styles.topSection}>
                <img src="https://i.pravatar.cc/40" alt="User Avatar" className={styles.avatar} />
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${postType === 'text' ? styles.activeTab : ''}`}
                        onClick={() => setPostType('text')}
                    >
                        <FiType /> Text
                    </button>
                    <button 
                        className={`${styles.tabButton} ${postType === 'poll' ? styles.activeTab : ''}`}
                        onClick={() => setPostType('poll')}
                    >
                        <FiBarChart2 /> Poll
                    </button>
                </div>
            </div>

            <div className={styles.createPostInputSection}>
                <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder={postType === 'poll' ? "Ask a question..." : "Title"}
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                
                {postType === 'text' && (
                    <input
                        type="text"
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's on your mind?"
                        className={styles.createPostInput}
                        disabled={isLoading}
                    />
                )}

                {postType === 'poll' && (
                    <div className={styles.pollOptionsContainer}>
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Add some context (optional)..."
                            className={styles.pollDescriptionInput}
                            disabled={isLoading}
                        />
                        {pollOptions.map((option, index) => (
                            <div key={index} className={styles.pollOptionRow}>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className={styles.pollOptionInput}
                                    disabled={isLoading}
                                />
                                {pollOptions.length > 2 && (
                                    <button onClick={() => handleRemoveOption(index)} className={styles.removeOptionButton}>
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleAddOption} className={styles.addOptionButton} disabled={isLoading}>
                            <FiPlus /> Add Option
                        </button>
                    </div>
                )}

                <button
                    onClick={handlePost}
                    disabled={(!postTitle.trim() && !postText.trim() && postType === 'text') || (postType === 'poll' && !postTitle.trim()) || isLoading}
                    className={styles.createPostButton}
                >
                    {isLoading ? 'Posting...' : 'Post'}
                </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default CreatePost;