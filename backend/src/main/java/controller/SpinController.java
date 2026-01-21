package controller;

import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.SpinService;
import service.UserService;

@RestController
@RequestMapping("/spin")
public class SpinController {

    public SpinController() {}

    private SpinService spinService;
    private UserService userService;

    public SpinController(SpinService spinService, UserService userService) {
        this.spinService = spinService;
        this.userService = userService;
    }

    @PostMapping("/daily")
    public ResponseEntity<ResultError> dailySpin(@RequestParam String email) {
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404)
                .body(new ResultError(false, "User not found"));

        int points = spinService.dailySpin(user);
        if (points == -1) return ResponseEntity.ok(new ResultError(false, "You have already spun today"));

        return ResponseEntity.ok(new ResultError(true, "You earned " + points + " points today!"));
    }
}
