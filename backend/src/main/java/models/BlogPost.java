package models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "blog_posts")
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comments> comments = new ArrayList<>();

    // In loc de set<Integer>, salvam userii care au dat like
    @ElementCollection
    @CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id")
    private Set<Integer> likedBy = new HashSet<>();

    public BlogPost() {} // obligatoriu pentru JPA

    public BlogPost(User author, String content) {
        this.author = author;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // --- Getteri și setteri ---
    public int getId() { return id; }

    public User getAuthor() { return author; }

    public String getContent() { return content; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<Comments> getComments() { return comments; }

    public int getLikes() { return likedBy.size(); }

    public boolean isLikedBy(int id) { return  likedBy.contains(id); }

    public ResultError editContent(String content) {
        if (content.trim().isEmpty()) {
            return new ResultError(false, "Content cannot be empty");
        }
        this.content = content;
        return new ResultError(true, "Content updated");
    }

    public ResultError addComment(Comments comment) {
        if (comment == null || comment.getContent().isEmpty()) {
            return new ResultError(false, "Comment cannot be empty");
        }
        comments.add(comment);
        comment.setPost(this);
        return new ResultError(true, "Comment added");
    }

    public ResultError toggleLike(User author) {
        if (likedBy.contains(author.getId())) {
            likedBy.remove(author.getId());
            return new ResultError(true, "Like removed");
        } else {
            likedBy.add(author.getId());
            return new ResultError(true, "Like added");
        }
    }
}