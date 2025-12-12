import React, { useState, useContext } from 'react';
import styles from './CreatePolls.module.css'; // Changed to CreatePolls.module.css
import { FiPlus, FiX, FiUser } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const CreatePolls = () => { // Renamed component
    const { user } = useContext(UserContext);
    const navigate = useNavigate(); // Initialize navigate hook
    const [postTitle, setPostTitle] = useState('');
    const [postText, setPostText] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const validOptions = pollOptions.filter(opt => opt.trim() !== '');

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
        if (!postTitle.trim()) { // Only title is mandatory for a poll
            setError('Please provide a title for the poll.');
            return;
        }

        if (validOptions.length < 2) {
            setError('Please provide at least two valid options for the poll.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call for creating a poll
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const optionsToSubmit = validOptions; // Use valid options

            // Here, instead of onCreatePost, you would typically dispatch an action
            // or call an API to create the poll.
            // For now, we'll simulate success and navigate.
            console.log('Poll created:', {
                title: postTitle,
                body: postText,
                options: optionsToSubmit,
                user: user?.username
            });

            // Reset form fields
            setPostTitle('');
            setPostText('');
            setPollOptions(['', '']);
            
            // Navigate back to homepage or a confirmation page
            navigate('/homepage'); // Navigate to homepage after successful poll creation

        } catch (err) {
            setError('Failed to create poll. Please try again.');
            console.error('Error submitting poll:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.createPollsContainer}> {/* Changed class name */}
            <div className={styles.topSection}>
                {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="User Avatar" className={styles.avatar} />
                ) : (
                    <FiUser className={styles.avatar} />
                )}
                {/* No tabs needed for CreatePolls, as it's only for polls */}
                <h2 className={styles.pageTitle}>Create a New Poll</h2> {/* Added a title for the page */}
            </div>

            <div className={styles.createPollInputSection}>
                <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Ask a question for your poll..." // Specific placeholder for poll
                    className={styles.createPostInput}
                    disabled={isLoading}
                />
                
                <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Add some context to your poll (optional)..." // Specific placeholder
                    className={styles.pollDescriptionInput}
                    disabled={isLoading}
                />
                
                <div className={styles.pollOptionsContainer}>
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

                <button
                    onClick={handlePost}
                    disabled={!postTitle.trim() || validOptions.length < 2 || isLoading} // Updated disabled logic
                    className={styles.createPostButton}
                >
                    {isLoading ? 'Creating Poll...' : 'Create Poll'}
                </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default CreatePolls;