import React, { useState, useContext, useEffect } from 'react';
import styles from './CreatePolls.module.css';
import { IoMdAdd, IoMdTrash, IoMdStats, IoMdSettings, IoMdTime, IoMdEyeOff, IoMdClose } from 'react-icons/io';
import TopBar from '../homepage/TopBar';
import DatePicker, { registerLocale } from 'react-datepicker';
import ro from 'date-fns/locale/ro';
import "react-datepicker/dist/react-datepicker.css";
import { UserContext } from '../../context/UserContext';
import PollCard from '../../components/PollCard/PollCard';
import { AnimatePresence, motion } from 'framer-motion';

registerLocale('ro', ro);

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
    const { user, token } = useContext(UserContext);
    
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); 
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [pollDuration, setPollDuration] = useState('1'); 
    const [customEndDate, setCustomEndDate] = useState(null); 
    
    const [myPolls, setMyPolls] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPollId, setEditingPollId] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    const isEditing = editingPollId !== null;
    const [creationFormKey, setCreationFormKey] = useState(0); 

    useEffect(() => {
        const fetchMyPolls = async () => {
            if (!token || !user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            
            try {
                const response = await fetch('/api/polls', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const allPolls = await response.json();
                    const userPolls = allPolls.filter(p => 
                        p.creator?.id === user.id || p.creatorId === user.id
                    );
                    setMyPolls(userPolls);
                } else {
                    console.error('[CREATE POLL] Failed to fetch polls');
                    setMyPolls([]);
                }
            } catch (error) {
                console.error('[CREATE POLL] Error fetching polls:', error);
                setMyPolls([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPolls();
    }, [token, user]);

    useEffect(() => {
        if (customEndDate && customEndDate < new Date()) {
            setCustomEndDate(null); 
        }
    }, [customEndDate]);
    
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

    const calculateEndDate = (durationDays) => {
        const now = new Date();
        const hours = parseFloat(durationDays) * 24;
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
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

    const handleResetForm = () => {
        setQuestion('');
        setOptions(['', '']);
        setAllowMultiple(false);
        setIsAnonymous(false);
        setPollDuration('1');
        setCustomEndDate(null);
        setEditingPollId(null);
        setCreationFormKey(prev => prev + 1); 
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        handleResetForm();
    };
    
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        
        if (!isEditing || !token) return;
        
        alert('Edit functionality coming soon!');
        handleCloseModal();
    };

    const formatDateForBackend = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isEditing || !token || !user) return;

        const endDate = pollDuration === 'custom' 
            ? customEndDate 
            : calculateEndDate(pollDuration);

        const newPoll = {
            title: question,
            description: '',
            endDate: formatDateForBackend(endDate),
            options: options
                .filter(opt => opt.trim() !== '')
                .map((optText, idx) => ({
                    optionText: optText,
                    totalVotes: 0
                }))
        };


        try {
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newPoll),
            });

            if (response.ok) {
                const createdPoll = await response.json();
                
                setMyPolls([createdPoll, ...myPolls]);
                handleResetForm();
                alert('Poll created successfully!');
            } else {
                const error = await response.json();
                console.error('[CREATE POLL] Failed to create poll:', error);
                alert(error.message || 'Failed to create poll');
            }
        } catch (error) {
            console.error('[CREATE POLL] Error creating poll:', error);
            alert('Error creating poll');
        }
    };

    const handlePollVote = (updatedPoll) => {
        setMyPolls(currentPolls => 
            currentPolls.map(p => p.id === updatedPoll.id ? updatedPoll : p)
        );
    };

    const handleDeletePoll = async (pollId) => {
        if (!token) return;

        if (window.confirm("Delete this poll?")) {

            try {
                const response = await fetch(`/api/polls/${pollId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    setMyPolls(currentPolls => currentPolls.filter(p => p.id !== pollId));
                } else {
                    const error = await response.json();
                    alert(error.message || 'Failed to delete poll');
                }
            } catch (error) {
                console.error('[CREATE POLL] Error deleting poll:', error);
                alert('Error deleting poll');
            }
        }
    };

    const handleEditPoll = (poll) => {
        setQuestion(poll.title);
        setOptions(poll.options?.map(opt => opt.optionText || opt.text) || ['', '']);
        setEditingPollId(poll.id);
        setIsEditModalOpen(true);
    };

    const isFormValid = question.trim() !== '' && 
                        options.filter(o => o.trim()).length >= 2 && 
                        (pollDuration !== 'custom' || customEndDate !== null);

    const currentUserIdentifier = user ? { name: user.name || user.username, id: user.id } : null;
    
    const renderPollForm = (submitHandler, buttonText, isCancelButtonVisible) => (
        <form onSubmit={submitHandler}>
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

            <div className={styles.footer}>
                <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={!isFormValid}
                >
                    {buttonText}
                </button>
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
                    <div 
                        key={isEditing ? 'editing' : creationFormKey} 
                        className={styles.createPollCard} 
                        style={{marginBottom: '2rem'}}
                    >
                        <h2 className={styles.title}>
                            <IoMdStats style={{ color: 'var(--accent)' }} /> 
                            Create a Poll
                        </h2>
                        {renderPollForm(handleSubmit, 'Create Poll', false)}
                    </div>

                    <AnimatePresence>
                        {isEditModalOpen && (
                            <EditPollModal isOpen={isEditModalOpen} onClose={handleCloseModal}>
                                <h2 className={styles.title}>
                                    <IoMdStats style={{ color: 'var(--accent)' }} /> 
                                    Edit Poll
                                </h2>
                                {renderPollForm(handleSaveEdit, 'Save Changes', true)} 
                            </EditPollModal>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your polls...</div>
                    ) : myPolls.length > 0 ? (
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
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            No polls created yet. Create your first poll above!
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreatePolls;