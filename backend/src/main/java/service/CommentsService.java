package service;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.BlogPostRepository;
import repository.CommentsRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CommentsService {

    private final CommentsRepository commentsRepository;
    private final BlogPostRepository blogPostRepository;

    public CommentsService(CommentsRepository commentsRepository, BlogPostRepository blogPostRepository) {
        this.commentsRepository = commentsRepository;
        this.blogPostRepository = blogPostRepository;
    }

    public List<Comments> getAllComments() {
        return commentsRepository.findAll();
    }

    public Optional<Comments> getCommentById(int id) {
        return commentsRepository.findById(id);
    }

    @Transactional
    public ResultError addComment(int postId, Comments comment) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return new ResultError(false, "Post not found");
        }

        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            return new ResultError(false, "Comment cannot be empty");
        }

        BlogPost post = postOpt.get();
        comment.setPost(post);

        commentsRepository.save(comment);
        return new ResultError(true, "Comment added successfully");
    }

    @Transactional
    public ResultError editComment(int commentId, String newContent) {
        Optional<Comments> commentOpt = commentsRepository.findById(commentId);
        if (commentOpt.isEmpty()) return new ResultError(false, "Comment not found");

        Comments comment = commentOpt.get();
        if (newContent == null || newContent.trim().isEmpty()) {
            return new ResultError(false, "Comment cannot be empty");
        }

        comment.setContent(newContent);
        commentsRepository.save(comment);
        return new ResultError(true, "Comment updated successfully");
    }

    @Transactional
    public ResultError deleteComment(int commentId) {
        System.out.println("🗑️ [BACKEND] Attempting to delete comment ID: " + commentId);

        Optional<Comments> commentOpt = commentsRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            System.out.println("🗑️ [BACKEND] Comment not found in DB");
            return new ResultError(false, "Comment not found");
        }

        Comments comment = commentOpt.get();
        System.out.println("🗑️ [BACKEND] Found comment: " + comment.getComment());
        System.out.println("🗑️ [BACKEND] Comment belongs to post ID: " + (comment.getPost() != null ? comment.getPost().getId() : "null"));

        try {
            // ✅ IMPORTANT: Remove comment from post's collection first
            if (comment.getPost() != null) {
                BlogPost post = comment.getPost();
                post.getComments().remove(comment);
                blogPostRepository.save(post);
                System.out.println("🗑️ [BACKEND] Removed comment from post's collection");
            }

            // Then delete the comment
            commentsRepository.delete(comment);
            commentsRepository.flush(); // Force immediate DB write

            System.out.println("🗑️ [BACKEND] Comment deleted from DB");

            // Verify deletion
            boolean stillExists = commentsRepository.existsById(commentId);
            System.out.println("🗑️ [BACKEND] Comment still exists after delete: " + stillExists);

            return new ResultError(true, "Comment deleted successfully");
        } catch (Exception e) {
            System.out.println("🗑️ [BACKEND] ERROR deleting comment: " + e.getMessage());
            e.printStackTrace();
            return new ResultError(false, "Error deleting comment: " + e.getMessage());
        }
    }
}