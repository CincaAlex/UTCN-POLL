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

        Optional<Comments> commentOpt = commentsRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return new ResultError(false, "Comment not found");
        }

        Comments comment = commentOpt.get();

        try {
            if (comment.getPost() != null) {
                BlogPost post = comment.getPost();
                post.getComments().remove(comment);
                blogPostRepository.save(post);
            }

            commentsRepository.delete(comment);
            commentsRepository.flush();

            boolean stillExists = commentsRepository.existsById(commentId);

            return new ResultError(true, "Comment deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResultError(false, "Error deleting comment: " + e.getMessage());
        }
    }
}