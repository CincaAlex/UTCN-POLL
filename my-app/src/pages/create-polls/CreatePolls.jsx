import React, { useState, useContext, useEffect } from 'react';
import styles from './CreatePolls.module.css';
import { IoMdAdd, IoMdTrash, IoMdStats, IoMdSettings, IoMdTime, IoMdEyeOff, IoMdClose } from 'react-icons/io';
import TopBar from '../homepage/TopBar';
import DatePicker, { registerLocale } from 'react-datepicker';
import ro from 'date-fns/locale/ro';
import "react-datepicker/dist/react-datepicker.css";
import { UserContext } from '../../context/UserContext';
import PollCard from '../../components/PollCard/PollCard';
import { INITIAL_POLLS } from '../../data/polls.js';
import { AnimatePresence, motion } from 'framer-motion';

// Register Romanian locale
registerLocale('ro', ro);

// Simple reusable modal component for the edit form (Unchanged)
const EditPollModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className={styles.modalContent}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} 
            >
                <button className={styles.closeModalBtn} onClick={onClose} aria-label="Close modal">
                    <IoMdClose size={24} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
};


const CreatePolls = () => {
    const { user } = useContext(UserContext);
    
    // --- STATE FOR FORM DATA (SHARED: Used for both Creation and Editing) ---
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); 
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [pollDuration, setPollDuration] = useState('1'); 
    const [customEndDate, setCustomEndDate] = useState(null); 
    
    // --- STATE FOR EDITING & FEED ---
    const [myPolls, setMyPolls] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPollId, setEditingPollId] = useState(null); 
    
    const isEditing = editingPollId !== null;

    // State used to force the creation form to re-render and clear itself
    const [creationFormKey, setCreationFormKey] = useState(0); 

    useEffect(() => {
        if (user) {
            const userName = user.name || user.username;
            const userExistingPolls = INITIAL_POLLS.filter(p => p.author && p.author.name === userName);
            setMyPolls(userExistingPolls);
        }
    }, [user]);

    useEffect(() => {
        if (customEndDate && customEndDate < new Date()) {
            setCustomEndDate(null); 
        }
    }, [customEndDate]);
    
    // --- UTILITIES ---

    const getFinalDurationText = (duration, endDate) => {
        if (duration === 'custom' && endDate) {
            return `Ends at ${endDate.toLocaleString('ro-RO')}`;
        }
        const durationMap = {
            '0.04': '1 Hour', '0.25': '6 Hours', '0.5': '12 Hours', 
            '1': '1 Day', '3': '3 Days', '7': '1 Week'
        };
        return durationMap[duration] || '1 Day';
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 10) { 
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };
    
    // --- CORE HANDLERS ---

    // NOTE: handleResetForm is now only used for clearing the state for a new creation cycle
    const handleResetForm = () => {
        setQuestion('');
        setOptions(['', '']);
        setAllowMultiple(false);
        setIsAnonymous(false);
        setPollDuration('1');
        setCustomEndDate(null);
        setEditingPollId(null);
        // Reset the form key to force re-render/clearing of the creation form fields
        setCreationFormKey(prev => prev + 1); 
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        handleResetForm(); // Clears shared state AND forces creation form refresh
    };
    
    const handleSaveEdit = (e) => {
        e.preventDefault();
        
        if (!isEditing) return;
        
        const finalDuration = getFinalDurationText(pollDuration, customEndDate);

        setMyPolls(currentPolls => 
            currentPolls.map(p => {
                if (p.id === editingPollId) {
                    return {
                        ...p,
                        question,
                        options: options.map((txt, idx) => ({ id: p.options[idx]?.id || `new_opt_${Date.now()}_${idx}`, text: txt, votes: p.options[idx]?.votes || 0 })),
                        isAnonymous,
                        allowMultiple,
                        pollDuration: finalDuration,
                        userVotedOptionIds: [], 
                        totalVotes: p.totalVotes, 
                    };
                }
                return p;
            })
        );

        handleCloseModal();
        console.log(`Poll ID ${editingPollId} Updated.`);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) return;

        const finalDuration = getFinalDurationText(pollDuration, customEndDate);

        const newPoll = {
            id: Date.now(),
            author: { 
                name: user?.name || user?.username || 'Me', 
                avatar: user?.photoUrl 
            },
            question,
            options: options.map((txt, idx) => ({ id: `new_opt_${idx}`, text: txt, votes: 0 })),
            totalVotes: 0,
            timeLeftPercentage: 100,
            status: 'Active',
            userVotedOptionIds: [],
            isAnonymous,
            allowMultiple,
            pollDuration: finalDuration
        };

        setMyPolls([newPoll, ...myPolls]);
        console.log('Poll Created:', newPoll);
        handleResetForm();
    };

    // --- POLL CARD HANDLERS ---

    const handlePollVote = (updatedPoll) => {
        setMyPolls(currentPolls => 
            currentPolls.map(p => p.id === updatedPoll.id ? updatedPoll : p)
        );
    };

    const handleDeletePoll = (pollId) => {
        if (window.confirm("Delete this poll?")) {
            setMyPolls(currentPolls => currentPolls.filter(p => p.id !== pollId));
        }
    };

    // Handler to load poll data into the form for editing
    const handleEditPoll = (poll) => {
        
        // 1. Load the selected poll data into state (this affects both forms temporarily)
        setEditingPollId(poll.id);
        setQuestion(poll.question);
        setOptions(poll.options.map(o => o.text));
        setAllowMultiple(poll.allowMultiple);
        setIsAnonymous(poll.isAnonymous);
        setPollDuration('1'); 
        setCustomEndDate(null); 
        
        // 2. Open the modal
        setIsEditModalOpen(true); 
    };
    
    // --- VALIDATION ---
    const isFormValid = question.trim() !== '' && 
                        options.every(opt => opt.trim() !== '') &&
                        (pollDuration !== 'custom' || customEndDate !== null);

    const currentUserIdentifier = user ? { name: user.name || user.username } : null;
    
    // Render Prop: The content of the poll form (reused for creation and editing)
    const renderPollForm = (submitHandler, buttonText, isCancelButtonVisible) => (
        <form onSubmit={submitHandler}>
            {/* Question Input */}
            <div className={styles.inputGroup}>
                <label className={styles.label}>Question</label>
                <input
                    type="text"
                    className={styles.questionInput}
                    placeholder="What do you want to ask?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={150}
                />
            </div>

            {/* Options List */}
            <div className={styles.inputGroup}>
                <label className={styles.label}>Options</label>
                <div className={styles.optionsList}>
                    {options.map((option, index) => (
                        <div key={index} className={styles.optionRow}>
                            <div className={styles.optionInputWrapper}>
                                <input
                                    type="text"
                                    className={styles.optionInput}
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    maxLength={50}
                                />
                            </div>
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => removeOption(index)}
                                    title="Remove option"
                                >
                                    <IoMdTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.addOptionBtn}
                    onClick={addOption}
                    disabled={options.length >= 10}
                >
                    <IoMdAdd /> Add Option
                </button>
            </div>

            {/* Settings */}
            <div className={styles.settingsSection}>
                <div className={styles.settingItem}>
                    <div className={styles.settingLabel}><IoMdSettings /> <span>Allow Multiple Answers</span></div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.settingItem}>
                    <div className={styles.settingLabel}><IoMdEyeOff /> <span>Anonymous Voting</span></div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.settingItem}>
                    <div className={styles.settingLabel}><IoMdTime /> <span>Poll Duration</span></div>
                    <div className={styles.durationControlWrapper}>
                        <select 
                            className={styles.selectInput}
                            value={pollDuration}
                            onChange={(e) => setPollDuration(e.target.value)}
                            style={{ marginBottom: pollDuration === 'custom' ? '0.5rem' : '0' }}
                        >
                            <option value="0.04">1 Hour</option>
                            <option value="0.25">6 Hours</option>
                            <option value="0.5">12 Hours</option>
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7">1 Week</option>
                            <option value="custom">Custom Date & Time</option>
                        </select>

                        {pollDuration === 'custom' && (
                            <div className={styles.customDatePickerWrapper}>
                                <DatePicker 
                                    selected={customEndDate} 
                                    onChange={(date) => setCustomEndDate(date)} 
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="Select end date & time"
                                    className={styles.datePickerInput}
                                    minDate={new Date()}
                                    locale="ro"
                                    wrapperClassName={styles.reactDatepickerWrapper}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit/Save Button */}
            <div className={styles.footer}>
                <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={!isFormValid}
                >
                    {buttonText}
                </button>
                {/* Only show Cancel button if requested (i.e., in the modal) */}
                {isCancelButtonVisible && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleCloseModal}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );

    return (
        <>
            <TopBar />
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* Poll Creation Form (Uses the key trick to remain clean) */}
                    {/* The key forces React to reset the state of this component instance when the key changes. */}
                    <div 
                        key={isEditing ? 'editing' : creationFormKey} 
                        className={styles.createPollCard} 
                        style={{marginBottom: '2rem'}}
                    >
                        <h2 className={styles.title}>
                            <IoMdStats style={{ color: 'var(--accent)' }} /> 
                            Create a Poll
                        </h2>
                        {/* Creation form does NOT show the Cancel button */}
                        {renderPollForm(handleSubmit, 'Create Poll', false)}
                    </div>

                    {/* Edit Modal (Renders the same form content) */}
                    <AnimatePresence>
                        {isEditModalOpen && (
                            <EditPollModal isOpen={isEditModalOpen} onClose={handleCloseModal}>
                                <h2 className={styles.title}>
                                    <IoMdStats style={{ color: 'var(--accent)' }} /> 
                                    Edit Poll
                                </h2>
                                {/* Edit form SHOWS the Cancel button */}
                                {renderPollForm(handleSaveEdit, 'Save Changes', true)} 
                            </EditPollModal>
                        )}
                    </AnimatePresence>

                    {/* My Polls Feed */}
                    {myPolls.length > 0 && (
                        <>
                            <h3 className={styles.title} style={{marginTop: '2rem'}}>My Active Polls</h3>
                            <AnimatePresence>
                                {myPolls.map(poll => (
                                    <PollCard 
                                        key={poll.id} 
                                        poll={poll} 
                                        onVote={handlePollVote}
                                        onDelete={handleDeletePoll}
                                        onEdit={handleEditPoll}
                                        currentUser={currentUserIdentifier}
                                    />
                                ))}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreatePolls;