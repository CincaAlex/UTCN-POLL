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
        List<BlogPost> posts = blogPostRepository.findAll();

        // ✅ DEBUG: Log câte comentarii are fiecare post
        System.out.println("🔍 [BACKEND] Fetched " + posts.size() + " posts");
        for (BlogPost post : posts) {
            int commentCount = post.getComments() != null ? post.getComments().size() : 0;
            System.out.println("🔍 [BACKEND] Post ID: " + post.getId() +
                    " | Title: " + post.getTitle() +
                    " | Comments: " + commentCount);

            if (commentCount > 0) {
                System.out.println("🔍 [BACKEND] Comments for post " + post.getId() + ":");
                for (Comments c : post.getComments()) {
                    System.out.println("   - Comment ID: " + c.getId() +
                            " | Author: " + (c.getAuthor() != null ? c.getAuthor().getName() : "null") +
                            " | Text: " + c.getComment());
                }
            }
        }

        return posts;
    }

    public Optional<BlogPost> getPostById(int id) {
        Optional<BlogPost> post = blogPostRepository.findById(id);

        if (post.isPresent()) {
            int commentCount = post.get().getComments() != null ? post.get().getComments().size() : 0;
            System.out.println("🔍 [BACKEND] Found post ID: " + id + " with " + commentCount + " comments");
        }

        return post;
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

        System.out.println("🔍 [BACKEND] Adding comment to post ID: " + postId);
        System.out.println("🔍 [BACKEND] Comment text: " + comment.getComment());
        System.out.println("🔍 [BACKEND] Comment author: " + (comment.getAuthor() != null ? comment.getAuthor().getName() : "null"));

        ResultError res = post.addComment(comment);

        if (res.isSuccess()) {
            blogPostRepository.save(post);
            System.out.println("🔍 [BACKEND] Comment saved. Post now has " + post.getComments().size() + " comments");
        }

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