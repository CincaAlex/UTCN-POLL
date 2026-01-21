package service;

import models.ResultError;
import models.User;
import org.springframework.stereotype.Service;
import repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    public UserService() {}
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ResultError createUser(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            return new ResultError(false, "Email already registered");
        }

        try {
            User user = new User(name, email, password);
            userRepository.save(user);
            return new ResultError(true, "User created successfully");
        } catch (Exception e) {
            return new ResultError(false, "Failed to create user: " + e.getMessage());
        }
    }

    public Optional<User> getUserById(int id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void addPoints(User user, int points) {
        user.addPoints(points);
        userRepository.save(user);
    }

    public ResultError decreasePoints(User user, int points) {
        if (user.getPoints() < points) {
            return new ResultError(false, "Points can't be less than " + points);
        }
        user.decreasePoints(points);
        userRepository.save(user);
        return new ResultError(true, "");
    }

    public boolean authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        return user.checkPassword(password);
    }
}
