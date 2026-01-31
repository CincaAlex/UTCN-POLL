package controller;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import repository.UserRepository;
import service.BlogPostService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class BlogPostController {

    private final BlogPostService blogPostService;
    private final UserRepository userRepository;

    public BlogPostController(BlogPostService blogPostService, UserRepository userRepository) {
        this.blogPostService = blogPostService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<BlogPost>> getAllPosts() {
        return ResponseEntity.ok(blogPostService.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable int id) {
        Optional<BlogPost> post = blogPostService.getPostById(id);
        return post.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Post not found"));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody CreatePostRequest req, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        String email = auth.getPrincipal().toString();
        Optional<User> authorOpt = userRepository.findByEmail(email);
        if (authorOpt.isEmpty()) {
            return ResponseEntity.status(401).body(new ResultError(false, "User not found for token"));
        }

        BlogPost post = new BlogPost();
        post.setAuthor(authorOpt.get());
        post.setTitle(req.title() == null ? "" : req.title().trim());
        post.setContent(req.content() == null ? "" : req.content().trim());

        BlogPost saved = blogPostService.savePost(post);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultError> editPost(@PathVariable int id, @RequestBody String content) {
        return ResponseEntity.ok(blogPostService.editPost(id, content));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable int id,
            @RequestBody AddCommentRequest req,
            java.security.Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            String email = principal.getName();
            Optional<User> authorOpt = userRepository.findByEmail(email);

            if (authorOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            Optional<BlogPost> postOpt = blogPostService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ResultError(false, "Post not found"));
            }

            Comments comment = new Comments(authorOpt.get(), req.comment());

            ResultError result = blogPostService.addComment(id, comment);

            if (!result.isSuccess()) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(comment);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResultError(false, "Error adding comment: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable int id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            ResultError result = blogPostService.toggleLikeByEmail(id, principal.getName());

            if (!result.isSuccess()) {
                return ResponseEntity.badRequest().body(result);
            }

            Optional<BlogPost> updatedPost = blogPostService.getPostById(id);

            if (updatedPost.isEmpty()) {
                return ResponseEntity.status(404).body(new ResultError(false, "Post not found"));
            }

            return ResponseEntity.ok(updatedPost.get());

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResultError(false, "Error toggling like: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable int id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            Optional<BlogPost> postOpt = blogPostService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ResultError(false, "Post not found"));
            }

            BlogPost post = postOpt.get();

            String email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            User currentUser = userOpt.get();

            boolean isOwner = post.getAuthor() != null && post.getAuthor().getId() == currentUser.getId();
            boolean isAdmin = "ADMIN".equals(currentUser.getUserType());

            if (!isOwner && !isAdmin) {
                return ResponseEntity.status(403).body(new ResultError(false, "Forbidden: You don't have permission to delete this post"));
            }

            ResultError result = blogPostService.deletePost(id);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResultError(false, "Error deleting post: " + e.getMessage()));
        }
    }

    public record CreatePostRequest(String title, String content) {}

    public record AddCommentRequest(String comment) {}
}