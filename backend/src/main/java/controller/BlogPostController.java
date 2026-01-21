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

    // ✅ FIX REAL: create post ia doar title/content + author din JWT
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

        // IMPORTANT: vrem să returnăm postarea salvată (cu id), nu doar ResultError
        BlogPost saved = blogPostService.savePost(post);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultError> editPost(@PathVariable int id, @RequestBody String content) {
        return ResponseEntity.ok(blogPostService.editPost(id, content));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ResultError> addComment(@PathVariable int id, @RequestBody Comments comment) {
        return ResponseEntity.ok(blogPostService.addComment(id, comment));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ResultError> toggleLike(@PathVariable int id, @RequestBody User user) {
        return ResponseEntity.ok(blogPostService.toggleLike(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultError> deletePost(@PathVariable int id) {
        return ResponseEntity.ok(blogPostService.deletePost(id));
    }

    // ✅ DTO simplu: NU e funcție, e doar formatul request-ului
    public record CreatePostRequest(String title, String content) {}
}
