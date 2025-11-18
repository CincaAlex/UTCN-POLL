import React from 'react';
import PostCard from './PostCard';

const posts = [
    {
        id: 1,
        user: { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' },
        time: '3h',
        title: 'First time using the new platform!',
        body: 'Just wanted to say this new UTCNHub platform looks amazing. Great job to the team who built this. Looking forward to creating some polls.',
        counts: { likes: 25, comments: 2, shares: 2 },
        comments: [
            { user: { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' }, text: 'I agree, it looks great!' },
            { user: { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' }, text: 'Can\'t wait to see the new features.' },
        ],
        likedBy: [
            { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' },
            { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' },
        ]
    },
    {
        id: 2,
        user: { name: 'u/vladm', avatar: 'https://i.pravatar.cc/24?u=vladm' },
        time: '5h',
        title: 'Feedback on the "Create Poll" feature',
        body: 'I think it would be great if we could add images to the poll options. Would make them much more engaging. What do you guys think?',
        counts: { likes: 42, comments: 1, shares: 5 },
        comments: [
            { user: { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' }, text: 'That is a fantastic idea!' },
        ],
        likedBy: [
            { name: 'u/andreip', avatar: 'https://i.pravatar.cc/24?u=andreip' },
        ]
    },
    {
        id: 3,
        user: { name: 'u/elenac', avatar: 'https://i.pravatar.cc/24?u=elenac' },
        time: '1d',
        title: 'Study group for IS exam?',
        body: 'Is anyone interested in forming a study group for the upcoming Information Systems exam? We could meet at the library. Let me know in the comments!',
        counts: { likes: 18, comments: 0, shares: 1 },
        comments: [],
        likedBy: []
    },
    {
        id: 4,
        user: { name: 'u/danam', avatar: 'https://i.pravatar.cc/24?u=danam' },
        time: '1d',
        title: 'Lost & Found: Blue Water Bottle',
        body: 'I think I left my blue water bottle in room C103 after the databases course yesterday. Has anyone seen it?',
        counts: { likes: 5, comments: 0, shares: 0 },
        comments: [],
        likedBy: []
    },
    {
        id: 5,
        user: { name: 'u/mihait', avatar: 'https://i.pravatar.cc/24?u=mihait' },
        time: '2d',
        title: 'Anyone else excited for the hackathon next month?',
        body: 'The topics for the upcoming hackathon have been announced and they look super interesting. Who is planning on participating?',
        counts: { likes: 33, comments: 0, shares: 8 },
        comments: [],
        likedBy: []
    },
    {
        id: 6,
        user: { name: 'u/ioanap', avatar: 'https://i.pravatar.cc/24?u=ioanap' },
        time: '2d',
        title: 'Question about the latest Computer Networks assignment',
        body: 'I am a bit confused about the subnetting part of the assignment. Can someone explain how to calculate the broadcast address?',
        counts: { likes: 8, comments: 0, shares: 0 },
        comments: [],
        likedBy: []
    },
    {
        id: 7,
        user: { name: 'u/cristig', avatar: 'https://i.pravatar.cc/24?u=cristig' },
        time: '3d',
        title: 'Best coffee on campus?',
        body: 'Let\'s settle this once and for all. Which place has the best coffee on campus? My vote is for the little cafe near the main entrance.',
        counts: { likes: 57, comments: 0, shares: 4 },
        comments: [],
        likedBy: []
    },
    {
        id: 8,
        user: { name: 'u/laurab', avatar: 'https://i.pravatar.cc/24?u=laurab' },
        time: '4d',
        title: 'Just a cool picture of the sunset from the dorm window',
        body: 'The sky was on fire tonight! Had to share.',
        counts: { likes: 102, comments: 0, shares: 11 },
        comments: [],
        likedBy: []
    }
];

const Feed = () => {
    return (
        <div className="feed">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
};

export default Feed;