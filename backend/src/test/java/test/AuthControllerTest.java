package test;

import controller.AuthController;
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
import service.AuthService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private User testUser;
    private final String TEST_NAME = "Test User";
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_PASSWORD = "password123";
    private final int TEST_VERIFICATION_CODE = 123456;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testUser = new User(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);
        testUser.setVerificationCode(TEST_VERIFICATION_CODE);
        testUser.setVerified(false);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        reset(authService);
    }

    @Test
    void register_Success() {
        // Arrange
        ResultError successResult = new ResultError(true, "User created! Verification code sent to email.");
        when(authService.register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = authController.register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("User created! Verification code sent to email.", response.getBody().getMessage());
        verify(authService, times(1)).register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);
    }

    @Test
    void register_Failure() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Email already exists");
        when(authService.register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = authController.register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode()); // Still 200 but success=false
        assertFalse(response.getBody().isSuccess());
        assertEquals("Email already exists", response.getBody().getMessage());
        verify(authService, times(1)).register(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);
    }

    @Test
    void login_Success() {
        // Arrange
        String token = "jwt.token.here";
        ResultError successResult = new ResultError(true, token);
        when(authService.login(TEST_EMAIL, TEST_PASSWORD)).thenReturn(successResult);

        // Act
        ResponseEntity<ResultError> response = authController.login(TEST_EMAIL, TEST_PASSWORD);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(token, response.getBody().getMessage());
        verify(authService, times(1)).login(TEST_EMAIL, TEST_PASSWORD);
    }

    @Test
    void login_Failure_InvalidCredentials() {
        // Arrange
        ResultError failureResult = new ResultError(false, "Invalid credentials");
        when(authService.login(TEST_EMAIL, TEST_PASSWORD)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = authController.login(TEST_EMAIL, TEST_PASSWORD);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid credentials", response.getBody().getMessage());
        verify(authService, times(1)).login(TEST_EMAIL, TEST_PASSWORD);
    }

    @Test
    void login_Failure_UserNotVerified() {
        // Arrange
        ResultError failureResult = new ResultError(false, "User not verified");
        when(authService.login(TEST_EMAIL, TEST_PASSWORD)).thenReturn(failureResult);

        // Act
        ResponseEntity<ResultError> response = authController.login(TEST_EMAIL, TEST_PASSWORD);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("User not verified", response.getBody().getMessage());
        verify(authService, times(1)).login(TEST_EMAIL, TEST_PASSWORD);
    }

    @Test
    void verify_Success() {
        // Arrange
        when(authService.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(authService.saveUser(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<ResultError> response = authController.verify(TEST_EMAIL, TEST_VERIFICATION_CODE);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("User verified successfully!", response.getBody().getMessage());
        verify(authService, times(1)).findByEmail(TEST_EMAIL);
        verify(authService, times(1)).saveUser(testUser);
    }

    @Test
    void verify_UserNotFound() {
        // Arrange
        when(authService.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<ResultError> response = authController.verify(TEST_EMAIL, TEST_VERIFICATION_CODE);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("User not found", response.getBody().getMessage());
        verify(authService, times(1)).findByEmail(TEST_EMAIL);
        verify(authService, never()).saveUser(any(User.class));
    }

    @Test
    void verify_InvalidCode() {
        // Arrange
        int wrongCode = 999999;
        when(authService.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<ResultError> response = authController.verify(TEST_EMAIL, wrongCode);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid verification code", response.getBody().getMessage());
        verify(authService, times(1)).findByEmail(TEST_EMAIL);
        verify(authService, never()).saveUser(any(User.class));
    }

    @Test
    void verify_NullVerificationCode() {
        // Arrange
        testUser.setVerificationCode(null);
        when(authService.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<ResultError> response = authController.verify(TEST_EMAIL, TEST_VERIFICATION_CODE);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid verification code", response.getBody().getMessage());
        verify(authService, times(1)).findByEmail(TEST_EMAIL);
        verify(authService, never()).saveUser(any(User.class));
    }

    @Test
    void verify_AlreadyVerified() {
        // Arrange
        testUser.setVerified(true);
        when(authService.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<ResultError> response = authController.verify(TEST_EMAIL, TEST_VERIFICATION_CODE);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("User is already verified", response.getBody().getMessage());
        verify(authService, times(1)).findByEmail(TEST_EMAIL);
        verify(authService, never()).saveUser(any(User.class));
    }

    @Test
    void constructor_Injection() {
        // This test verifies that the constructor injection works properly
        AuthController controller = new AuthController(authService);
        assertNotNull(controller);
    }
}