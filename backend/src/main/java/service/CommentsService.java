package service;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
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

    public ResultError deleteComment(int commentId) {
        Optional<Comments> commentOpt = commentsRepository.findById(commentId);
        if (commentOpt.isEmpty()) return new ResultError(false, "Comment not found");

        commentsRepository.delete(commentOpt.get());
        return new ResultError(true, "Comment deleted successfully");
    }
}