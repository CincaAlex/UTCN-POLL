export const INITIAL_POLLS = [
    {
        id: 1,
        author: { name: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
        question: 'Care este cel mai eficient mod de comunicare cu profesorii?',
        options: [
            { id: 'opt1', text: 'Email', votes: 15 },
            { id: 'opt2', text: 'Platforma Moodle/Teams', votes: 25 },
            { id: 'opt3', text: 'Consultații fizice', votes: 10 },
            { id: 'opt4', text: 'Grupuri WhatsApp/Discord', votes: 5 },
        ],
        totalVotes: 55,
        timeLeftPercentage: 80,
        status: 'Active',
        userVotedOptionIds: [],
        isAnonymous: false,
        allowMultiple: false,
        pollDuration: '5 days'
    },
    {
        id: 2,
        author: { name: 'OSUT Cluj', avatar: 'https://i.pravatar.cc/150?u=osut' },
        question: 'Ce evenimente extra-curriculare ar trebui să organizeze universitatea?',
        options: [
            { id: 'opt1', text: 'Hackathoane', votes: 20 },
            { id: 'opt2', text: 'Workshop-uri cu firme', votes: 30 },
            { id: 'opt3', text: 'Seri de film/board games', votes: 15 },
            { id: 'opt4', text: 'Sesiuni de sport', votes: 10 },
            { id: 'opt5', text: 'Petreceri studențești', votes: 25 },
        ],
        totalVotes: 100,
        timeLeftPercentage: 100,
        status: 'Ended',
        userVotedOptionIds: ['opt2', 'opt5'],
        isAnonymous: true,
        allowMultiple: true,
        pollDuration: 'Ended'
    },
    {
        id: 3,
        author: { name: 'Cantina UTCN', avatar: 'https://i.pravatar.cc/150?u=cantina' },
        question: 'Ce îmbunătățiri sunt necesare în cantina facultății?',
        options: [
            { id: 'opt1', text: 'Diversitate mai mare în meniu', votes: 35 },
            { id: 'opt2', text: 'Prețuri mai mici', votes: 45 },
            { id: 'opt3', text: 'Program extins', votes: 20 },
        ],
        totalVotes: 100,
        timeLeftPercentage: 30,
        status: 'Active',
        userVotedOptionIds: [],
        isAnonymous: false,
        allowMultiple: false,
        pollDuration: '2 days'
    },
    {
        id: 4,
        author: { name: 'Secretariat AC', avatar: 'https://i.pravatar.cc/150?u=secretariat' },
        question: 'Cum ar trebui să arate noile spații de studiu?',
        options: [
            { id: 'opt1', text: 'Zone liniștite individuale', votes: 18 },
            { id: 'opt2', text: 'Spații de grup cu proiectoare', votes: 22 },
            { id: 'opt3', text: 'Mese de lucru ajustabile', votes: 10 },
            { id: 'opt4', text: 'Acces 24/7', votes: 30 },
        ],
        totalVotes: 80,
        timeLeftPercentage: 60,
        status: 'Active',
        userVotedOptionIds: [],
        isAnonymous: true,
        allowMultiple: true,
        pollDuration: '1 week'
    }
];