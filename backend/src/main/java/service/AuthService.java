package service;

import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.UserRepository;
import utils.JwtUtil;
import security.MailService;

import java.util.Optional;

@Service
public class AuthService {

        private final UserRepository userRepository;

        private final UserService userService;

        private final MailService mailService;

    

        public AuthService(UserRepository userRepository, UserService userService, MailService mailService) {

            this.userRepository = userRepository;

            this.userService = userService;

            this.mailService = mailService;

        }

    public ResultError register(String name, String email, String password) {
        ResultError result = userService.createUser(name, email, password);
        if (!result.isSuccess()) return result;

        User user = userRepository.findByEmail(email).get();
        int code = mailService.sendVerificationCode(email);
        user.setVerificationCode(code);
        userRepository.save(user);

        return new ResultError(true, "User created! Verification code sent to email.");
    }

    public ResultError login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return new ResultError(false, "User not found");

        User user = userOpt.get();
        if (!user.checkPassword(password)) return new ResultError(false, "Invalid credentials");
        if (!user.isVerified()) return new ResultError(false, "User not verified");

        String token = JwtUtil.generateToken(user.getEmail());
        return new ResultError(true, token);
    }

    public boolean validateToken(String token) {
        return JwtUtil.validateToken(token);
    }

    public String getEmailFromToken(String token) {
        return JwtUtil.getSubject(token);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}