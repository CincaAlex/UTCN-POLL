package test;

import controller.BlogPostController;
import models.BlogPost;
import models.Comments;
import models.ResultError;
import models.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import service.BlogPostService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogPostControllerTest {

    @Mock
    private BlogPostService blogPostService;

    @InjectMocks
    private BlogPostController blogPostController;

    private User testAuthor;
    private BlogPost testPost;
    private Comments testComment;
    private final String TEST_CONTENT = "This is a test blog post content";
    private final String UPDATED_CONTENT = "This is updated content";

    @BeforeEach
    void setUp() {
        // Initialize test data
        testAuthor = new User("Test Author", "author@example.com", "password123");

        testPost = new BlogPost(testAuthor, TEST_CONTENT);

        testComment = new Comments(testAuthor, "This is a test comment");
        testComment.setId(1);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        reset(blogPostService);
    }

    @Test
    void getAllPosts_Success() {
        // Arrange
        BlogPost post2 = new BlogPost(testAuthor, "Another post");
        List<BlogPost> posts = Arrays.asList(testPost, post2);
        when(blogPostService.getAllPosts()).thenReturn(posts);

        // Act
        ResponseEntity<List<BlogPost>> response = blogPostController.getAllPosts();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(blogPostService, times(1)).getAllPosts();
    }

    @Test
    void getAllPosts_EmptyList() {
        // Arrange
        when(blogPostService.getAllPosts()).thenReturn(List.of());

        // Act
        ResponseEntity<List<BlogPost>> response = blogPostController.getAllPosts();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(blogPostService, times(1)).getAllPosts();
    }

    @Test
    void getPostById_Success() {
        // Arrange
        // Create a new post to return from service
        BlogPost savedPost = new BlogPost(testAuthor, "Saved post");
        // We can't set id, so we'll just mock the service to return it
        when(blogPostService.getPostById(1)).thenReturn(Optional.of(savedPost));

        // Act
        ResponseEntity<?> response = blogPostController.getPostById(1);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof BlogPost);
        BlogPost returnedPost = (BlogPost) response.getBody();
        assertEquals(savedPost, returnedPost);
        verify(blogPostService, times(1)).getPostById(1);
    }

    @Test
    void getPostById_NotFound() {
        // Arrange
        when(blogPostService.getPostById(999)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = blogPostController.getPostById(999);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Post not found", response.getBody());
        verify(blogPostService, times(1)).getPostById(999);
    }

    @Test
    void createPost_Success() {
        // Arrange
        ResultError successResult = new ResultError(true, "Post created successfully");
        when(blogPostService.createPost(any(BlogPost.class))).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.createPost(testPost);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Post created successfully", response.getBody().getMessage());
        verify(blogPostService, times(1)).createPost(any(BlogPost.class));
    }

    @Test
    void createPost_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Author cannot be null");
        when(blogPostService.createPost(any(BlogPost.class))).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.createPost(testPost);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Author cannot be null", response.getBody().getMessage());
        verify(blogPostService, times(1)).createPost(any(BlogPost.class));
    }

    @Test
    void editPost_Success() {
        // Arrange
        ResultError successResult = new ResultError(true, "Post updated successfully");
        when(blogPostService.editPost(1, UPDATED_CONTENT)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.editPost(1, UPDATED_CONTENT);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Post updated successfully", response.getBody().getMessage());
        verify(blogPostService, times(1)).editPost(1, UPDATED_CONTENT);
    }

    @Test
    void editPost_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Post not found");
        when(blogPostService.editPost(999, UPDATED_CONTENT)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.editPost(999, UPDATED_CONTENT);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Post not found", response.getBody().getMessage());
        verify(blogPostService, times(1)).editPost(999, UPDATED_CONTENT);
    }

    @Test
    void addComment_Success() {
        // Arrange
        ResultError successResult = new ResultError(true, "Comment added successfully");
        when(blogPostService.addComment(1, testComment)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.addComment(1, testComment);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Comment added successfully", response.getBody().getMessage());
        verify(blogPostService, times(1)).addComment(1, testComment);
    }

    @Test
    void addComment_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Post not found");
        when(blogPostService.addComment(999, testComment)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.addComment(999, testComment);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Post not found", response.getBody().getMessage());
        verify(blogPostService, times(1)).addComment(999, testComment);
    }

    @Test
    void toggleLike_Success_AddLike() {
        // Arrange
        ResultError successResult = new ResultError(true, "Like added");
        when(blogPostService.toggleLike(1, testAuthor)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.toggleLike(1, testAuthor);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Like added", response.getBody().getMessage());
        verify(blogPostService, times(1)).toggleLike(1, testAuthor);
    }

    @Test
    void toggleLike_Success_RemoveLike() {
        // Arrange
        ResultError successResult = new ResultError(true, "Like removed");
        when(blogPostService.toggleLike(1, testAuthor)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.toggleLike(1, testAuthor);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Like removed", response.getBody().getMessage());
        verify(blogPostService, times(1)).toggleLike(1, testAuthor);
    }

    @Test
    void toggleLike_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Post not found");
        when(blogPostService.toggleLike(999, testAuthor)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.toggleLike(999, testAuthor);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Post not found", response.getBody().getMessage());
        verify(blogPostService, times(1)).toggleLike(999, testAuthor);
    }

    @Test
    void deletePost_Success() {
        // Arrange
        ResultError successResult = new ResultError(true, "Post deleted successfully");
        when(blogPostService.deletePost(1)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.deletePost(1);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Post deleted successfully", response.getBody().getMessage());
        verify(blogPostService, times(1)).deletePost(1);
    }

    @Test
    void deletePost_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Post not found");
        when(blogPostService.deletePost(999)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = blogPostController.deletePost(999);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Post not found", response.getBody().getMessage());
        verify(blogPostService, times(1)).deletePost(999);
    }

    @Test
    void constructor_Injection() {
        // This test verifies that the constructor injection works properly
        BlogPostController controller = new BlogPostController(blogPostService);
        assertNotNull(controller);
    }

    @Test
    void testBlogPostEntityMethods() {
        // Test BlogPost entity methods directly
        assertEquals(0, testPost.getId());
        assertEquals(testAuthor, testPost.getAuthor());
        assertEquals(TEST_CONTENT, testPost.getContent());
        assertNotNull(testPost.getCreatedAt());
        assertNotNull(testPost.getComments());
        assertEquals(0, testPost.getLikes());
    }

    @Test
    void testBlogPostEditContent() {
        // Test BlogPost.editContent() method
        ResultError editResult = testPost.editContent(UPDATED_CONTENT);
        assertTrue(editResult.isSuccess());
        assertEquals("Content updated", editResult.getMessage());
        assertEquals(UPDATED_CONTENT, testPost.getContent());
    }

    @Test
    void testBlogPostEditContent_EmptyContent() {
        // Test BlogPost.editContent() with empty content
        ResultError editResult = testPost.editContent("   ");
        assertFalse(editResult.isSuccess());
        assertEquals("Content cannot be empty", editResult.getMessage());
        // Content should remain unchanged
        assertEquals(TEST_CONTENT, testPost.getContent());
    }

    @Test
    void testBlogPostAddComment() {
        // Test BlogPost.addComment() method
        ResultError commentResult = testPost.addComment(testComment);
        assertTrue(commentResult.isSuccess());
        assertEquals("Comment added", commentResult.getMessage());
        assertEquals(1, testPost.getComments().size());
        assertEquals(testPost, testComment.getPost());
    }

    @Test
    void testBlogPostAddComment_EmptyComment() {
        // Test BlogPost.addComment() with empty comment
        Comments emptyComment = new Comments(testAuthor, "");
        ResultError commentResult = testPost.addComment(emptyComment);
        assertFalse(commentResult.isSuccess());
        assertEquals("Comment cannot be empty", commentResult.getMessage());
        assertEquals(0, testPost.getComments().size());
    }

    @Test
    void testBlogPostToggleLike() {
        // Test BlogPost.toggleLike() method - add like
        ResultError likeResult = testPost.toggleLike(testAuthor);
        assertTrue(likeResult.isSuccess());
        assertEquals("Like added", likeResult.getMessage());
        assertEquals(1, testPost.getLikes());
        assertTrue(testPost.isLikedBy(testAuthor.getId()));

        // Test BlogPost.toggleLike() method - remove like
        ResultError unlikeResult = testPost.toggleLike(testAuthor);
        assertTrue(unlikeResult.isSuccess());
        assertEquals("Like removed", unlikeResult.getMessage());
        assertEquals(0, testPost.getLikes());
        assertFalse(testPost.isLikedBy((testAuthor.getId())));
    }
}