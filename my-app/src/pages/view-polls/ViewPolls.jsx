import React, { useState, useContext } from 'react';
import TopBar from '../homepage/TopBar';
import styles from './ViewPolls.module.css'; // Keep page layout styles
import { AnimatePresence } from 'framer-motion';
import PollCard from '../../components/PollCard/PollCard';
import { INITIAL_POLLS } from '../../data/polls';
import { UserContext } from '../../context/UserContext';

const ViewPolls = () => {
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const { user } = useContext(UserContext);

    const handlePollVote = (updatedPoll) => {
        setPolls(currentPolls => 
            currentPolls.map(p => p.id === updatedPoll.id ? updatedPoll : p)
        );
    };

    const handleDeletePoll = (pollId) => {
        if (window.confirm("Are you sure you want to delete this poll?")) {
            setPolls(currentPolls => currentPolls.filter(p => p.id !== pollId));
        }
    };

    const handleEditPoll = (poll) => {
        alert(`Edit functionality for poll "${poll.question}" would open here.`);
        // In a real app, you might navigate to /edit-poll/:id or open a modal
    };

    const sortedPolls = [...polls].sort((a, b) => {
        if (a.status === 'Ended' && b.status !== 'Ended') return -1;
        if (a.status !== 'Ended' && b.status === 'Ended') return 1;
        return b.totalVotes - a.totalVotes;
    });

    // Create a user object structure that matches what PollCard expects for comparison
    const currentUser = user ? { name: user.name || user.username } : null;

    return (
        <>
            <TopBar />
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <h1 className={styles.pageTitle} style={{marginBottom: '1.5rem'}}>All Active Polls</h1>
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
                        <div className={styles.emptyState}>No polls found.</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewPolls;
