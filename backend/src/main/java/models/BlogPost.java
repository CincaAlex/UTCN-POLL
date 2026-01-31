package models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "blog_posts")
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (title == null) title = "";
        if (content == null) content = "";
    }

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Comments> comments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id")
    private Set<Integer> likedBy = new HashSet<>();

    public BlogPost() {}

    public BlogPost(User author, String title, String body) {
        this.author = author;
        this.title = title;
        this.content = body;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public User getAuthor() { return author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Comments> getComments() { return comments; }
    public int getLikes() { return likedBy.size(); }
    public boolean isLikedBy(int id) { return likedBy.contains(id); }

    public Set<Integer> getLikedBy() { return likedBy; }

    public void setAuthor(User author) { this.author = author; }

    public String getTitle() { return title; }

    @JsonProperty("body")
    public String getBody() { return content; }

    public void setTitle(String title) { this.title = title; }

    @JsonProperty("body")
    public void setBody(String body) { this.content = body; }

    @JsonIgnore
    public String getContent() { return content; }

    @JsonIgnore
    public void setContent(String content) { this.content = content; }

    public ResultError editContent(String content) {
        if (content == null || content.trim().isEmpty()) {
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