package service;

import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.BlogPostRepository;
import repository.UserRepository;


import java.util.List;
import java.util.Optional;

@Service
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    public BlogPostService(BlogPostRepository blogPostRepository, UserRepository userRepository) {
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
    }

    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    public Optional<BlogPost> getPostById(int id) {
        return blogPostRepository.findById(id);
    }

    public ResultError createPost(BlogPost post) {
        blogPostRepository.save(post);
        return new ResultError(true, "Post created successfully");
    }

    public BlogPost savePost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    public ResultError toggleLikeByEmail(int postId, String email) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) return new ResultError(false, "Post not found");

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) return new ResultError(false, "User not found");

        BlogPost post = postOpt.get();
        ResultError res = post.toggleLike(user);
        blogPostRepository.save(post);
        return res;
    }


    public ResultError editPost(int postId, String newContent) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) return new ResultError(false, "Post not found");
        BlogPost post = postOpt.get();
        ResultError editResult = post.editContent(newContent);
        if (!editResult.isSuccess()) return editResult;
        blogPostRepository.save(post);
        return new ResultError(true, "Post updated");
    }

    public ResultError addComment(int postId, Comments comment) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) return new ResultError(false, "Post not found");
        BlogPost post = postOpt.get();
        ResultError res = post.addComment(comment);
        blogPostRepository.save(post);
        return res;
    }

    public ResultError toggleLike(int postId, User user) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) return new ResultError(false, "Post not found");
        BlogPost post = postOpt.get();
        ResultError res = post.toggleLike(user);
        blogPostRepository.save(post);
        return res;
    }

    public ResultError deletePost(int postId) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) return new ResultError(false, "Post not found");
        blogPostRepository.delete(postOpt.get());
        return new ResultError(true, "Post deleted");
    }
}