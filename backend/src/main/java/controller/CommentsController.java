package controller;

import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import repository.UserRepository;
import service.CommentsService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentsController {

    private final CommentsService commentsService;
    private final UserRepository userRepository;

    public CommentsController(CommentsService commentsService, UserRepository userRepository) {
        this.commentsService = commentsService;
        this.userRepository = userRepository;
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
    public ResponseEntity<?> deleteComment(@PathVariable int id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            // Get the comment
            Optional<Comments> commentOpt = commentsService.getCommentById(id);
            if (commentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ResultError(false, "Comment not found"));
            }

            Comments comment = commentOpt.get();

            // Get current user
            String email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            User currentUser = userOpt.get();

            // ✅ Check permissions: must be comment owner OR post owner OR admin
            boolean isCommentOwner = comment.getAuthor() != null && comment.getAuthor().getId() == currentUser.getId();
            boolean isPostOwner = comment.getPost() != null &&
                    comment.getPost().getAuthor() != null &&
                    comment.getPost().getAuthor().getId() == currentUser.getId();
            boolean isAdmin = "ADMIN".equals(currentUser.getUserType());

            System.out.println("🔐 [DELETE COMMENT] User: " + currentUser.getName() + " (Type: " + currentUser.getUserType() + ")");
            System.out.println("🔐 [DELETE COMMENT] isCommentOwner: " + isCommentOwner);
            System.out.println("🔐 [DELETE COMMENT] isPostOwner: " + isPostOwner);
            System.out.println("🔐 [DELETE COMMENT] isAdmin: " + isAdmin);

            if (!isCommentOwner && !isPostOwner && !isAdmin) {
                return ResponseEntity.status(403).body(new ResultError(false, "Forbidden: You don't have permission to delete this comment"));
            }

            // Delete the comment
            ResultError result = commentsService.deleteComment(id);

            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.badRequest().body(result);

        } catch (Exception e) {
            System.err.println("Error deleting comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ResultError(false, "Error deleting comment: " + e.getMessage()));
        }
    }
}