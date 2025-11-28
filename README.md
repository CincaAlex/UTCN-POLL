# UTCN_POLL

UTCN_POLL is a full-stack social and prediction platform designed for students of **UTCN**, allowing them to post blogs, ask questions, interact socially, and participate in gamified polls using virtual coins.

## Inspiration
The idea originated from our **Instagram page**, which already served as a place for students to ask questions and communicate. However, it relied entirely on one person being online to answer and mediate discussions.  
We wanted to build a **scalable platform** where students could interact directly, collaborate, and engage without depending on a single intermediary.

---

## Features

### Social Feed
- Students can create blog posts and discussion threads.
- Users can like and comment on posts.
- Modern and clean interface for reading and interacting with content.

### Prediction Polls (Twitch-style)
- Admins can create multi-option polls (e.g., “How many will fail exam X?”).
- Students can bet **virtual coins** on poll outcomes.
- Winners receive proportional shares of the total coin pool.
- Adds competition and fun to the academic environment.

### Achievements & Coins
- Users earn coins by participating and engaging with the platform.
- Achievements unlock as users reach milestones (posts, poll wins, etc.).

### Role System
- **Students:** Create posts, comment, like, and vote in polls.
- **Admins:** Manage polls, moderate content, and oversee platform health.

---

## Tech Stack

### Backend
- Java Spring Boot  
- Layered architecture (Controller, Service, Repository)  
- Role-based authentication and authorization  

### Frontend
- React with modern component structure (Hooks, Context where applicable)  
- Responsive and intuitive UI  

### Database
- MySQL  
- JPA/Hibernate ORM  
- Clear relational schema for users, posts, comments, polls, votes, achievements  

---

## Architecture Overview
- React frontend communicates with a Spring Boot REST API.
- API interacts with a MySQL database.
- Clean separation of layers enabling maintainability, scalability, and clear responsibility boundaries.

---

**License:** MIT (for inspiration purposes only)
