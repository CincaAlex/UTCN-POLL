package controller;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.BlogPostService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class BlogPostController {

    private final BlogPostService blogPostService;

    public BlogPostController(BlogPostService blogPostService) {
        this.blogPostService = blogPostService;
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
    public ResponseEntity<ResultError> createPost(@RequestBody BlogPost post) {
        return ResponseEntity.ok(blogPostService.createPost(post));
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
}
