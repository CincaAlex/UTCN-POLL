package service;

import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.UserRepository;
import utils.JwtUtil;

import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public ResultError register(String name, String email, String password) {
        if (name == null || name.trim().isEmpty()) {
            return new ResultError(false, "Name cannot be empty");
        }
        if (email == null || email.trim().isEmpty()) {
            return new ResultError(false, "Email cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            return new ResultError(false, "Password cannot be empty");
        }

        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return new ResultError(false, "Email already in use");
        }

        User user = new User(name.trim(), email.trim(), password);
        user.setVerificationCode(100000 + new Random().nextInt(900000));
        user.setVerified(false);

        userRepository.save(user);

        return new ResultError(true, "Registered successfully. Verification code: " + user.getVerificationCode());
    }

    public ResultError login(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            return new ResultError(false, "Email cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            return new ResultError(false, "Password cannot be empty");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            return new ResultError(false, "Invalid credentials");
        }

        User user = userOpt.get();
        if (!user.checkPassword(password)) {
            return new ResultError(false, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new ResultError(true, token);
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim());
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public String getSubject(String token) {
        return jwtUtil.getSubject(token);
    }
}