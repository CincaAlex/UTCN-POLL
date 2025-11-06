package controller;

import models.Comments;
import models.ResultError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.CommentsService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentsController {

    private final CommentsService commentsService;

    public CommentsController(CommentsService commentsService) {
        this.commentsService = commentsService;
    }

    @GetMapping
    public ResponseEntity<List<Comments>> getAllComments() {
        return ResponseEntity.ok(commentsService.getAllComments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable int id) {
        Optional<Comments> comment = commentsService.getCommentById(id);
        if (comment.isPresent()) {
            return ResponseEntity.ok(comment.get());
        } else {
            return ResponseEntity.status(404).body("Comment not found");
        }
    }

    @PostMapping("/{postId}")
    public ResponseEntity<ResultError> addComment(@PathVariable int postId, @RequestBody Comments comment) {
        ResultError result = commentsService.addComment(postId, comment);
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultError> editComment(@PathVariable int id, @RequestBody String newContent) {
        ResultError result = commentsService.editComment(id, newContent);
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultError> deleteComment(@PathVariable int id) {
        ResultError result = commentsService.deleteComment(id);
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}
