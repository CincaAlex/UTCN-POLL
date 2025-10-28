package service;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.BlogPostRepository;

@Service
public class BlogPostService {
    private final BlogPostRepository blogPostRepository;

    public BlogPostService(BlogPostRepository blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    public ResultError toggleLike(int postId, User user){
        BlogPost post = blogPostRepository.findById(postId);
        if(post == null) return  new ResultError(false, "Post with id not found");
        post.addLike(user);
        blogPostRepository.save(post);
        return new ResultError(true,"");
    }

    public ResultError addComment(int postId, User user, Comments comment){
        BlogPost post = blogPostRepository.findById(postId);
        if(post == null) return  new ResultError(false, "Post with id not found");
        post.addComment(comment);
        blogPostRepository.save(post);
        return new ResultError(true,"");
    }
}
