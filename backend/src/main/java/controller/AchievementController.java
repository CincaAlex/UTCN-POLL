package controller;

import models.Achievement;
import models.ResultError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.AchievementService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(achievementService.getAllAchievements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAchievementById(@PathVariable int id) {
        Optional<Achievement> achievement = achievementService.getAchievementById(id);
        return achievement.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Achievement not found"));
    }

    @PostMapping
    public ResponseEntity<ResultError> createAchievement(@RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementService.createAchievement(achievement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultError> updateAchievement(@PathVariable int id, @RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementService.updateAchievement(id, achievement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultError> deleteAchievement(@PathVariable int id) {
        return ResponseEntity.ok(achievementService.deleteAchievement(id));
    }
}