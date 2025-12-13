import React, { useState, useEffect, useRef } from 'react';
import styles from './PollCard.module.css';
import { IoMdTrophy, IoMdTime, IoMdEyeOff, IoMdList, IoMdCheckmark } from 'react-icons/io';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

// Component for animating numbers
const AnimatedCounter = ({ value, format = (v) => Math.round(v) }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { stiffness: 30, damping: 15 });

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = format(latest);
            }
        });
        return () => unsubscribe();
    }, [springValue, format]);

    return <span ref={ref} />;
};

const PollOptionItem = ({ option, poll, isSelected, isWinner, showResults, onSelect }) => {
    const currentPercentage = poll.totalVotes > 0 
        ? Math.round((option.votes / poll.totalVotes) * 100) 
        : 0;

    return (
        <motion.div 
            layout 
            key={option.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
                ${styles.pollOption} 
                ${showResults ? styles.resultMode : ''} 
                ${!showResults && isSelected ? styles.selected : ''}
                ${isWinner ? styles.winner : ''}
            `}
            onClick={() => onSelect(option.id)}
        >
            {!showResults ? (
                <>
                    <div className={styles.optionLeft}>
                        {poll.allowMultiple ? (
                            <div className={`${styles.checkboxBox} ${isSelected ? styles.active : ''}`}>
                                {isSelected && <IoMdCheckmark className={styles.checkboxInner} />}
                            </div>
                        ) : (
                            <div className={`${styles.radioCircle} ${isSelected ? styles.active : ''}`}>
                                <div className={styles.radioInner}></div>
                            </div>
                        )}
                        <span className={styles.optionText}>{option.text}</span>
                    </div>
                </>
            ) : (
                <>
                    <motion.div 
                        className={styles.resultProgressBar}
                        initial={{ width: 0 }}
                        animate={{ width: `${currentPercentage}%` }} 
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    ></motion.div>
                    
                    <div className={styles.resultContent}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isWinner && <IoMdTrophy className={styles.winnerIcon} />}
                            <span className={styles.optionText}>{option.text}</span>
                        </div>
                        <span className={styles.voteStats}>
                            <AnimatedCounter 
                                value={currentPercentage} 
                                format={(v) => `${Math.round(v)}%`} 
                            /> 
                            {' ('}
                            <AnimatedCounter 
                                value={option.votes} 
                                format={(v) => Math.round(v)} 
                            />
                            {')'}
                        </span>
                    </div>
                </>
            )}
        </motion.div>
    );
};

const PollCard = ({ poll, onVote, onEdit, onDelete, currentUser }) => {
    const [selectedOptions, setSelectedOptions] = useState([]); 
    
    const hasVoted = poll.userVotedOptionIds.length > 0 || poll.status === 'Ended';
    const isOwner = currentUser && poll.author && poll.author.name === currentUser.name;

    const getWinnerId = () => {
        if (poll.totalVotes === 0) return null;
        return poll.options.reduce((prev, current) => 
            (prev.votes > current.votes) ? prev : current
        ).id;
    };

    const winnerId = getWinnerId();
    const isEnded = poll.status === 'Ended';
    const showResults = hasVoted || isEnded;

    const handleSelect = (optionId) => {
        if (showResults) return;

        if (poll.allowMultiple) {
            if (selectedOptions.includes(optionId)) {
                setSelectedOptions(selectedOptions.filter(id => id !== optionId));
            } else {
                setSelectedOptions([...selectedOptions, optionId]);
            }
        } else {
            setSelectedOptions([optionId]);
        }
    };

    const handleVoteClick = () => {
        if (selectedOptions.length > 0 && !showResults) {
            const updatedOptions = poll.options.map(opt => {
                if (selectedOptions.includes(opt.id)) {
                    return { ...opt, votes: opt.votes + 1 };
                }
                return opt;
            });

            const updatedPoll = {
                ...poll,
                options: updatedOptions,
                totalVotes: poll.totalVotes + selectedOptions.length,
                userVotedOptionIds: selectedOptions
            };

            onVote(updatedPoll);
        }
    };

    const displayedOptions = [...poll.options].sort((a, b) => {
        if (!showResults) return 0;
        return b.votes - a.votes;
    });

    return (
        <motion.div 
            layout 
            className={styles.pollCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.pollHeader}>
                <div className={styles.headerContent}>
                    {/* Owner Actions */}
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
                    </div>
                    
                    <div className={styles.pollQuestion}>{poll.question}</div>

                    <div className={styles.pollMeta}>
                        {poll.isAnonymous && (
                            <span className={styles.badge} title="Anonymous Voting">
                                <IoMdEyeOff className={styles.badgeIcon} /> Anonymous
                            </span>
                        )}
                        {poll.allowMultiple && (
                            <span className={styles.badge} title="Multiple Answers Allowed">
                                <IoMdList className={styles.badgeIcon} /> Multi-choice
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
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

            <div className={styles.pollFooter}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        className={styles.voteButton}
                        disabled={selectedOptions.length === 0 || showResults}
                        onClick={handleVoteClick}
                    >
                        {isEnded ? 'Vote Breakdown' : 'Vote'}
                    </button>
                    
                    {hasVoted && !isEnded && (
                        <span className={styles.votedText}>Voted!</span>
                    )}
                </div>
            </div>

            <div className={styles.bottomMeta}>
                <div className={styles.bottomProgressContainer}>
                    <div 
                        className={styles.bottomProgressBar} 
                        style={{ width: `${poll.timeLeftPercentage}%` }}
                    ></div>
                </div>
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
