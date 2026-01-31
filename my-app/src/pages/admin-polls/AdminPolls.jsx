import React, { useState, useContext, useEffect } from 'react';
import TopBar from '../homepage/TopBar';
import styles from './AdminPolls.module.css';
import { UserContext } from '../../context/UserContext';

const AdminPolls = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const { user, token } = useContext(UserContext);

    useEffect(() => {
        fetchExpiredPolls();
    }, [token]);

    const fetchExpiredPolls = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/polls', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                
                const expiredPolls = data.filter(poll => poll.expired && !poll.resolved);
                
                const normalizedPolls = expiredPolls.map(poll => {
                    return {
                        id: poll.id,
                        question: poll.title,
                        options: poll.options?.map(opt => ({
                            id: opt.id,
                            text: opt.optionText,
                            totalBets: opt.totalBets || 0,
                            totalVotes: opt.totalVotes || 0
                        })) || [],
                        totalBets: poll.options?.reduce((sum, opt) => sum + (opt.totalBets || 0), 0) || 0,
                        creatorName: poll.creatorName || 'Unknown',
                        endDate: poll.endDate,
                        resolved: poll.resolved || false
                    };
                });
                
                setPolls(normalizedPolls);
            }
        } catch (error) {
            console.error('Error fetching polls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolvePoll = async () => {
        if (!selectedPoll || !selectedWinner) {
            alert('Please select a winning option');
            return;
        }

        try {
            const response = await fetch(`/api/polls/${selectedPoll.id}/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    winningOptionId: selectedWinner
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Poll resolved successfully!');
                
                fetchExpiredPolls();
                setSelectedPoll(null);
                setSelectedWinner(null);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to resolve poll');
            }
        } catch (error) {
            console.error('Error resolving poll:', error);
            alert('Error resolving poll');
        }
    };

    if (user?.userType !== 'ADMIN') {
        return (
            <>
                <TopBar />
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        <h1>Access Denied</h1>
                        <p>Only admins can access this page.</p>
                    </div>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <TopBar />
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        <p>Loading polls...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <TopBar />
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>🏆 Resolve Expired Polls</h1>
                    
                    {polls.length === 0 ? (
                        <div className={styles.emptyState}>
                            No expired polls to resolve.
                        </div>
                    ) : (
                        <div className={styles.pollsList}>
                            {polls.map(poll => (
                                <div key={poll.id} className={styles.pollCard}>
                                    <div className={styles.pollHeader}>
                                        <h3>{poll.question}</h3>
                                        <span className={styles.totalBets}>
                                            Total Pool: {poll.totalBets} tokens
                                        </span>
                                    </div>
                                    
                                    <div className={styles.optionsList}>
                                        {poll.options.map(option => (
                                            <div 
                                                key={option.id} 
                                                className={`${styles.option} ${selectedPoll?.id === poll.id && selectedWinner === option.id ? styles.selected : ''}`}
                                                onClick={() => {
                                                    setSelectedPoll(poll);
                                                    setSelectedWinner(option.id);
                                                }}
                                            >
                                                <div className={styles.optionText}>
                                                    {option.text}
                                                </div>
                                                <div className={styles.optionStats}>
                                                    <span>{option.totalVotes} votes</span>
                                                    <span className={styles.bets}>{option.totalBets} tokens</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {selectedPoll?.id === poll.id && (
                                        <button 
                                            className={styles.resolveButton}
                                            onClick={handleResolvePoll}
                                        >
                                            ✅ Resolve Poll - Distribute Winnings
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminPolls;