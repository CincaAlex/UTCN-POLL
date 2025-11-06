package controller;

import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.UserService;

import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ResultError> register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        ResultError result = userService.createUser(name, email, password);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<ResultError> login(
            @RequestParam String email,
            @RequestParam String password) {

        boolean authenticated = userService.authenticate(email, password);
        if (authenticated) {
            return ResponseEntity.ok(new ResultError(true, "Login successful"));
        } else {
            return ResponseEntity.status(401).body(new ResultError(false, "Invalid credentials"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUserById(@PathVariable int id) {
        Optional<User> userOpt = userService.getUserById(id);
        return userOpt
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }

    @PostMapping("/{id}/addPoints")
    public ResponseEntity<ResultError> addPoints(
            @PathVariable int id,
            @RequestParam int points) {

        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ResultError(false, "User not found"));
        }
        userService.addPoints(userOpt.get(), points);
        return ResponseEntity.ok(new ResultError(true, "Points added successfully"));
    }

    @PostMapping("/{id}/decreasePoints")
    public ResponseEntity<ResultError> decreasePoints(
            @PathVariable int id,
            @RequestParam int points) {

        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ResultError(false, "User not found"));
        }
        ResultError success = userService.decreasePoints(userOpt.get(), points);
        if (success.isSuccess()) {
            return ResponseEntity.ok(new ResultError(true, "Points decreased successfully"));
        } else {
            return ResponseEntity.badRequest().body(new ResultError(false, "Not enough points"));
        }
    }
}
