import React, {
    useState,
    useEffect,
    useRef,
    useContext
} from 'react';

import styles from './PollCard.module.css';

import {
    IoMdTrophy,
    IoMdTime,
    IoMdEyeOff,
    IoMdList,
    IoMdCheckmark
} from 'react-icons/io';

import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import {
    motion,
    AnimatePresence,
    useSpring,
    useMotionValue
} from 'framer-motion';

import { UserContext } from '../../context/UserContext';

/* ---------------- Animated Counter ---------------- */
const AnimatedCounter = ({ value, format = (v) => Math.round(v) }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { stiffness: 30, damping: 15 });

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    useEffect(() => {
        const unsub = springValue.on('change', (latest) => {
            if (ref.current) ref.current.textContent = format(latest);
        });
        return () => unsub();
    }, [springValue, format]);

    return <span ref={ref} />;
};

/* ---------------- Poll Option ---------------- */

const PollOptionItem = ({
    option,
    poll,
    isSelected,
    isWinner,
    showResults,
    onSelect
}) => {
    const percentage =
        poll.totalVotes > 0
            ? Math.round((option.votes / poll.totalVotes) * 100)
            : 0;

    return (
        <motion.div
            layout
            key={option.id}
            className={`
                ${styles.pollOption}
                ${showResults ? styles.resultMode : ''}
                ${!showResults && isSelected ? styles.selected : ''}
                ${isWinner ? styles.winner : ''}
            `}
            onClick={() => onSelect(option.id)}
        >
            {!showResults ? (
                <div className={styles.optionLeft}>
                    {poll.allowMultiple ? (
                        <div className={`${styles.checkboxBox} ${isSelected ? styles.active : ''}`}>
                            {isSelected && <IoMdCheckmark />}
                        </div>
                    ) : (
                        <div className={`${styles.radioCircle} ${isSelected ? styles.active : ''}`}>
                            <div className={styles.radioInner} />
                        </div>
                    )}
                    <span className={styles.optionText}>{option.text}</span>
                </div>
            ) : (
                <>
                    <motion.div
                        className={styles.resultProgressBar}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2 }}
                    />
                    <div className={styles.resultContent}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isWinner && <IoMdTrophy className={styles.winnerIcon} />}
                            <span className={styles.optionText}>{option.text}</span>
                        </div>
                        <span className={styles.voteStats}>
                            <AnimatedCounter value={percentage} format={(v) => `${Math.round(v)}%`} />
                            {' ('}
                            <AnimatedCounter value={option.votes} />
                            {')'}
                        </span>
                    </div>
                </>
            )}
        </motion.div>
    );
};

/* ---------------- Poll Card ---------------- */

const PollCard = ({ poll, onVote, onEdit, onDelete }) => {
    const { user, addPollBet } = useContext(UserContext);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [betAmount, setBetAmount] = useState('');
    const [betError, setBetError] = useState('');

    const hasVoted =
        (poll.userVotedOptionIds?.length > 0) ||
        poll.status === 'Ended';

    const isEnded = poll.status === 'Ended';
    const showResults = hasVoted || isEnded;

    const isOwner = user && poll.author && poll.author.name === user.name;

    const winnerId =
        poll.totalVotes === 0
            ? null
            : poll.options.reduce((a, b) => (a.votes > b.votes ? a : b)).id;

    const userWon =
        isEnded &&
        winnerId &&
        poll.userVotedOptionIds?.includes(winnerId); // Adaugă "?" aici

    /* -------- Bet Validation (FIXED) -------- */

    useEffect(() => {
        const amount = Number(betAmount); 

        if (isNaN(amount) || amount < 1) {
            setBetError('Betting is mandatory (Min 1 token)');
        } else if (amount > (user?.tokens || 0)) {
            setBetError('Not enough tokens');
        } else {
            setBetError('');
        }
    }, [betAmount, user]);

    /* -------- Option Select -------- */

    const handleSelect = (optionId) => {
        if (showResults) return;

        poll.allowMultiple
            ? setSelectedOptions((prev) =>
                    prev.includes(optionId)
                        ? prev.filter((id) => id !== optionId)
                        : [...prev, optionId]
              )
            : setSelectedOptions([optionId]);
    };

    /* -------- Vote (FIXED) -------- */

    const handleVoteClick = () => {
        if (selectedOptions.length === 0 || showResults || betError) return;

        const amount = Number(betAmount);

        // Trimite votul la backend
        onVote(poll.id, selectedOptions[0], amount);

        // --- ADDPOLLBET INTEGRATION ---
        try {
            addPollBet({
                pollId: poll.id,
                optionIds: selectedOptions,
                betAmount: amount
            });
        } catch (err) {
            console.error(err.message);
        }

        // Reset local state
        setSelectedOptions([]);
        setBetAmount('');
    };

    const displayedOptions = [...poll.options].sort((a, b) =>
        showResults ? b.votes - a.votes : 0
    );

    /* -------- Render -------- */

    return (
        <motion.div
            layout
            className={`${styles.pollCard} ${userWon ? styles.won : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* WIN MESSAGE (INLINE) */}
            <AnimatePresence>
                {userWon && (
                    <motion.div
                        className={styles.winInline}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    >
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            🏆
                        </motion.div>
                        <strong>You Won!</strong>
                        <span>Winning pick</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER CONTENT WRAPPER */}
            <div className={styles.pollHeader}>
                
                {/* AUTHOR AND STATUS SECTION */}
                <div className={styles.authorSection}>
                    <img 
                        src={poll.author?.avatar || 'https://i.pravatar.cc/150'} 
                        alt={poll.author?.name} 
                        className={styles.authorAvatar} 
                    />
                    <div className={styles.authorInfo}>
                        <div className={styles.authorName}>{poll.author?.name || 'Unknown'}</div>
                        <div className={styles.statusWrapper}>
                            <div className={`${styles.statusDot} ${isEnded ? styles.ended : ''}`}></div>
                            <div className={styles.pollLabel}>
                                {isEnded ? 'Poll Ended' : 'Current Poll'}
                            </div>
                        </div>
                    </div>
                    
                    {/* OWNER ACTIONS (Edit/Delete) */}
                    {isOwner && (
                        <div className={styles.cardActions}>
                            <button 
                                className={styles.actionBtn} 
                                onClick={() => onEdit(poll)} 
                                title="Edit Poll"
                            >
                                <FiEdit2 />
                            </button>
                            <button 
                                className={`${styles.actionBtn} ${styles.delete}`} 
                                onClick={() => onDelete(poll.id)} 
                                title="Delete Poll"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    )}
                </div>

                {/* QUESTION AND META */}
                <div className={styles.pollQuestion}>{poll.question}</div>
                <div className={styles.pollMeta}>
                    {poll.isAnonymous && (
                        <span className={styles.badge}>
                            <IoMdEyeOff /> Anonymous
                        </span>
                    )}
                    {poll.allowMultiple && (
                        <span className={styles.badge}>
                            <IoMdList /> Multi-choice
                        </span>
                    )}
                </div>
            </div> {/* END pollHeader */}


            {/* Options */}
            <div className={styles.pollOptions}>
                <AnimatePresence>
                    {displayedOptions.map((option) => (
                        <PollOptionItem
                            key={option.id}
                            option={option}
                            poll={poll}
                            isSelected={selectedOptions.includes(option.id)}
                            isWinner={isEnded && option.id === winnerId}
                            showResults={showResults}
                            onSelect={handleSelect}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer (Betting and Vote Button) */}
            <div className={styles.pollFooter}>
                
                {/* Betting Container */}
                {!showResults && (
                    <div className={styles.betContainer}>
                        <div className={styles.betInputGroup}>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                placeholder="Bet tokens (Min 1)"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                className={`${styles.betInput} ${betError ? styles.betInputError : ''}`}
                                disabled={showResults}
                            />
                        </div>
                        <div className={styles.tokenInfo}>
                            Available: {user?.tokens ?? 0} tokens
                        </div>
                        {/* Display specific error message */}
                        {betError && <div className={styles.betError}>⚠️ {betError}</div>}
                    </div>
                )}
                
                {/* Vote Button */}
                <button
                    className={styles.voteButton}
                    // Disable if no option selected, results shown, or any betError exists
                    disabled={selectedOptions.length === 0 || showResults || !!betError} 
                    onClick={handleVoteClick}
                >
                    {isEnded ? 'Results' : `Vote`}
                </button>
                
                {/* Voted Text */}
                {hasVoted && !isEnded && (
                    <span className={styles.votedText}>Voted!</span>
                )}
            </div>

            {/* Time Left Meta */}
            <div className={styles.bottomMeta}>
                {!isEnded && (
                    <div className={styles.timeLeftText}>
                        <IoMdTime style={{ marginRight: '4px', verticalAlign: 'middle' }}/> 
                        Ends in {poll.pollDuration}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PollCard;