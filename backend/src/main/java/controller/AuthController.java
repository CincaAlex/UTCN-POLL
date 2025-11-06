package controller;

import models.ResultError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResultError> login(@RequestParam String email, @RequestParam String password) {
        ResultError result = authService.login(email, password);
        if (result.isSuccess()) return ResponseEntity.ok(result);
        return ResponseEntity.status(401).body(result);
    }

    @PostMapping("/register")
    public ResponseEntity<ResultError> register(@RequestParam String name,
                                                @RequestParam String email,
                                                @RequestParam String password) {
        return ResponseEntity.ok(authService.register(name, email, password));
    }
}
