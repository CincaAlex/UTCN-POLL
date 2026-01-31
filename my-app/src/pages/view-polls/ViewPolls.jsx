import React, { useState, useContext, useEffect } from 'react';
import TopBar from '../homepage/TopBar';
import styles from './ViewPolls.module.css';
import { AnimatePresence } from 'framer-motion';
import PollCard from '../../components/PollCard/PollCard';
import { UserContext } from '../../context/UserContext';

const ViewPolls = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token, updateUser } = useContext(UserContext);

    const calculateTimeLeft = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    useEffect(() => {
        const fetchPolls = async () => {
            setLoading(true);
            
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await fetch('/api/polls', { headers });

                if (response.ok) {
                    const data = await response.json();
                    
                    const normalizedPolls = data.map(poll => ({
                        id: poll.id,
                        question: poll.title,
                        options: poll.options?.map(opt => ({
                            id: opt.id,
                            text: opt.optionText,
                            votes: opt.totalBets || 0
                        })) || [],
                        totalVotes: poll.options?.reduce((sum, opt) => sum + (opt.totalBets || 0), 0) || 0, // ✅ Suma totalBets
                        author: {
                            name: poll.creatorName || `User #${poll.creatorId}`,
                            avatar: poll.creatorAvatar || 'https://i.pravatar.cc/150'
                        },
                        winningOptionId: poll.winningOptionId,
                        status: poll.expired ? 'Ended' : 'Active',
                        isAnonymous: poll.isAnonymous || false,
                        allowMultiple: poll.allowMultiple || false,
                        pollDuration: calculateTimeLeft(poll.endDate),
                        userVotedOptionIds: poll.userVotedOptionIds || [],
                        betAmount: poll.betAmount || 0
                    }));
                    
                    setPolls(normalizedPolls);
                }else {
                    console.error('[POLLS] Failed to fetch polls:', response.status);
                    setPolls([]);
                }
            } catch (error) {
                console.error('[POLLS] Error fetching polls:', error);
                setPolls([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, [token]);

    const handlePollVote = async (pollId, optionId, betAmount) => {
        if (!token || !user) {
            alert('Please log in to vote');
            return;
        }

        try {
            const response = await fetch(`/api/polls/${pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    optionId,
                    betAmount,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                
                const pollsResponse = await fetch('/api/polls', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (pollsResponse.ok) {
                    const data = await pollsResponse.json();
                    
                    const normalizedPolls = data.map(poll => ({
                        id: poll.id,
                        question: poll.title,
                        options: poll.options?.map(opt => ({
                            id: opt.id,
                            text: opt.optionText,
                            votes: opt.totalBets || 0
                        })) || [],
                        totalVotes: poll.options?.reduce((sum, opt) => sum + (opt.totalBets || 0), 0) || 0,
                        author: {
                            name: poll.creatorName || `User #${poll.creatorId}`,
                            avatar: poll.creatorAvatar || 'https://i.pravatar.cc/150'
                        },
                        status: poll.expired ? 'Ended' : 'Active',
                        isAnonymous: poll.isAnonymous || false,
                        allowMultiple: poll.allowMultiple || false,
                        pollDuration: calculateTimeLeft(poll.endDate),
                        userVotedOptionIds: poll.userVotedOptionIds || [optionId],
                        betAmount: poll.betAmount || 0
                    }));
                    
                    setPolls(normalizedPolls);
                    
                    const userResponse = await fetch(`/api/users/email/${encodeURIComponent(user.email)}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (userResponse.ok) {
                        const updatedUser = await userResponse.json();
                        updateUser(updatedUser);
                    }
                }
            } else {
                const error = await response.json();
                console.error('[POLLS] Vote failed:', error);
                alert(error.message || 'Failed to vote');
            }
        } catch (error) {
            console.error('[POLLS] Error voting:', error);
            alert('Error voting on poll');
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (!token || !user) {
            alert('Please log in to delete polls');
            return;
        }

        if (window.confirm("Are you sure you want to delete this poll?")) {

            try {
                const response = await fetch(`/api/polls/${pollId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setPolls(currentPolls => currentPolls.filter(p => p.id !== pollId));
                } else {
                    const error = await response.json();
                    console.error('[POLLS] Delete failed:', error);
                    alert(error.message || 'Failed to delete poll');
                }
            } catch (error) {
                console.error('[POLLS] Error deleting poll:', error);
                alert('Error deleting poll');
            }
        }
    };

    const handleEditPoll = (poll) => {
        alert(`Edit functionality for poll "${poll.title}" would open here.`);
        // TODO
    };

    const sortedPolls = [...polls].sort((a, b) => {
        const aIsExpired = new Date(a.endDate) < new Date();
        const bIsExpired = new Date(b.endDate) < new Date();
        
        if (aIsExpired && !bIsExpired) return 1;
        if (!aIsExpired && bIsExpired) return -1;
        
        const aTotalVotes = a.options?.reduce((sum, opt) => sum + (opt.totalVotes || 0), 0) || 0;
        const bTotalVotes = b.options?.reduce((sum, opt) => sum + (opt.totalVotes || 0), 0) || 0;
        return bTotalVotes - aTotalVotes;
    });

    const currentUser = user ? { 
        id: user.id,
        name: user.name || user.username,
        userType: user.userType 
    } : null;

    const isAdmin = user?.userType === 'ADMIN';

    if (loading) {
        return (
            <>
                <TopBar />
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        <div className={styles.emptyState}>Loading polls...</div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 className={styles.pageTitle}>All Active Polls</h1>
                        {isAdmin && (
                            <button 
                                className={styles.createPollButton}
                                onClick={() => window.location.href = '/create-poll'}
                            >
                                ➕ Create Poll
                            </button>
                        )}
                    </div>
                    
                    <AnimatePresence>
                        {sortedPolls.map(poll => (
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
                    
                    {sortedPolls.length === 0 && (
                        <div className={styles.emptyState}>
                            No polls found.
                            {isAdmin && (
                                <p style={{ marginTop: '1rem' }}>
                                    <button 
                                        className={styles.createPollButton}
                                        onClick={() => window.location.href = '/create-poll'}
                                    >
                                        Create your first poll
                                    </button>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewPolls;