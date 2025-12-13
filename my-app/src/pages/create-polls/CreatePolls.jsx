import React, { useState, useContext, useEffect } from 'react';
import styles from './CreatePolls.module.css';
import { IoMdAdd, IoMdTrash, IoMdStats, IoMdSettings, IoMdTime, IoMdEyeOff } from 'react-icons/io';
import TopBar from '../homepage/TopBar';
import DatePicker, { registerLocale } from 'react-datepicker';
import ro from 'date-fns/locale/ro';
import "react-datepicker/dist/react-datepicker.css";
import { UserContext } from '../../context/UserContext';
import PollCard from '../../components/PollCard/PollCard';
import { INITIAL_POLLS } from '../../data/polls';
import { AnimatePresence } from 'framer-motion';

// Register Romanian locale
registerLocale('ro', ro);

const CreatePolls = () => {
    const { user } = useContext(UserContext);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); 
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [pollDuration, setPollDuration] = useState('1'); 
    const [customEndDate, setCustomEndDate] = useState(null); 
    
    // State for "My Polls" feed - initialized with user's existing polls from mock data
    const [myPolls, setMyPolls] = useState([]);

    useEffect(() => {
        if (user) {
            const userName = user.name || user.username;
            // Filter initial polls belonging to current user
            const userExistingPolls = INITIAL_POLLS.filter(p => p.author && p.author.name === userName);
            setMyPolls(userExistingPolls);
        }
    }, [user]);

    // Ensure Custom Date is always a future date
    useEffect(() => {
        if (customEndDate && customEndDate < new Date()) {
            setCustomEndDate(null); 
        }
    }, [customEndDate]);


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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let finalDuration = pollDuration;
        if (pollDuration === 'custom' && customEndDate) {
            finalDuration = `Ends at ${customEndDate.toLocaleString('ro-RO')}`;
        } else if (pollDuration !== 'custom') {
             // Basic text mapping for duration
             const durationMap = {
                 '0.04': '1 Hour', '0.25': '6 Hours', '0.5': '12 Hours', 
                 '1': '1 Day', '3': '3 Days', '7': '1 Week'
             };
             finalDuration = durationMap[pollDuration] || '1 Day';
        }

        const newPoll = {
            id: Date.now(), // Unique ID based on timestamp
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

        // Add to local list
        setMyPolls([newPoll, ...myPolls]);
        
        console.log('Poll Created:', newPoll);
        
        // Reset form
        setQuestion('');
        setOptions(['', '']);
        setAllowMultiple(false);
        setIsAnonymous(false);
        setPollDuration('1');
        setCustomEndDate(null);
    };

    // Handler for voting on my own polls (local state update)
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

    const handleEditPoll = (poll) => {
        // Populate form with poll data
        setQuestion(poll.question);
        setOptions(poll.options.map(o => o.text));
        setAllowMultiple(poll.allowMultiple);
        setIsAnonymous(poll.isAnonymous);
        // Note: Duration editing logic is simplified here
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isFormValid = question.trim() !== '' && 
                        options.every(opt => opt.trim() !== '') &&
                        (pollDuration !== 'custom' || customEndDate !== null);

    const currentUser = user ? { name: user.name || user.username } : null;

    return (
        <>
            <TopBar />
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* Create Form */}
                    <div className={styles.createPollCard} style={{marginBottom: '2rem'}}>
                        <h2 className={styles.title}>
                            <IoMdStats style={{ color: 'var(--accent)' }} /> 
                            Create a Poll
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* ... (Inputs) ... */}
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
                                    <div className={styles.settingLabel}>
                                        <IoMdSettings /> 
                                        <span>Allow Multiple Answers</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input 
                                            type="checkbox" 
                                            checked={allowMultiple}
                                            onChange={(e) => setAllowMultiple(e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.settingItem}>
                                    <div className={styles.settingLabel}>
                                        <IoMdEyeOff /> 
                                        <span>Anonymous Voting</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input 
                                            type="checkbox" 
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.settingItem}>
                                    <div className={styles.settingLabel}>
                                        <IoMdTime /> 
                                        <span>Poll Duration</span>
                                    </div>
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
                                    Create Poll
                                </button>
                            </div>
                        </form>
                    </div>

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
                                        currentUser={currentUser}
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