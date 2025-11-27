package controller;

import models.ResultError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ResultError> register(@RequestParam String name,
                                                @RequestParam String email,
                                                @RequestParam String password) {
        return ResponseEntity.ok(authService.register(name, email, password));
    }

    @PostMapping("/login")
    public ResponseEntity<ResultError> login(@RequestParam String email,
                                             @RequestParam String password) {
        ResultError result = authService.login(email, password);
        if (result.isSuccess()) return ResponseEntity.ok(result);
        return ResponseEntity.status(401).body(result);
    }

    @PostMapping("/verify")
    public ResponseEntity<ResultError> verify(@RequestParam String email, @RequestParam int code) {
        var userOpt = authService.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(new ResultError(false, "User not found"));

        var user = userOpt.get();

        if (user.isVerified()) {
            return ResponseEntity.badRequest().body(new ResultError(false, "User is already verified"));
        }

        if (user.getVerificationCode() != null && user.getVerificationCode() == code) {
            user.setVerified(true);
            user.setVerificationCode(null);
            authService.saveUser(user);
            return ResponseEntity.ok(new ResultError(true, "User verified successfully!"));
        }

        return ResponseEntity.badRequest().body(new ResultError(false, "Invalid verification code"));
    }
}