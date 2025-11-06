package service;

import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.UserRepository;
import utils.JwtUtil;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;

    public AuthService(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public ResultError register(String name, String email, String password) {
        return userService.createUser(name, email, password);
    }

    public ResultError login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return new ResultError(false, "User not found");

        User user = userOpt.get();
        if (!user.checkPassword(password)) return new ResultError(false, "Invalid credentials");

        String token = JwtUtil.generateToken(user.getEmail());
        return new ResultError(true, token);
    }

    public boolean validateToken(String token) {
        return JwtUtil.validateToken(token);
    }

    public String getEmailFromToken(String token) {
        return JwtUtil.getSubject(token);
    }
}
