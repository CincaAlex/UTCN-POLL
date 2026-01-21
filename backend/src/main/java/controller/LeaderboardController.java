package controller;

import models.Achievement;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.LeaderboardService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    public LeaderboardController() {}

    private LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    /**
     * Get points leaderboard
     */
    @GetMapping("/points")
    public ResponseEntity<List<User>> getPointsLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getPointsLeaderboard(limit));
    }

    /**
     * Get achievements count leaderboard
     */
    @GetMapping("/achievements")
    public ResponseEntity<List<Map<String, Object>>> getAchievementsLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getAchievementsLeaderboard(limit));
    }

    /**
     * Get leaderboard for specific achievement type
     */
    @GetMapping("/achievements/{type}")
    public ResponseEntity<List<Map<String, Object>>> getAchievementTypeLeaderboard(
            @PathVariable Achievement.AchievementType type,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getAchievementTypeLeaderboard(type, limit));
    }

    /**
     * Get badge tier leaderboard (users with highest-tier badges)
     */
    @GetMapping("/badge-tiers")
    public ResponseEntity<List<Map<String, Object>>> getBadgeTierLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getBadgeTierLeaderboard(limit));
    }

    /**
     * Get user's points rank
     */
    @GetMapping("/user/{userId}/points-rank")
    public ResponseEntity<Integer> getUserPointsRank(@PathVariable int userId) {
        int rank = leaderboardService.getUserPointsRank(userId);
        if (rank == -1) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rank);
    }

    /**
     * Get user's achievements rank
     */
    @GetMapping("/user/{userId}/achievements-rank")
    public ResponseEntity<Integer> getUserAchievementsRank(@PathVariable int userId) {
        int rank = leaderboardService.getUserAchievementsRank(userId);
        if (rank == -1) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rank);
    }

    /**
     * Get user's leaderboard context (surrounding users)
     */
    @GetMapping("/user/{userId}/context")
    public ResponseEntity<Map<String, Object>> getUserLeaderboardContext(
            @PathVariable int userId,
            @RequestParam(defaultValue = "2") int contextSize) {
        Map<String, Object> context = leaderboardService.getUserLeaderboardContext(userId, contextSize);

        if (context.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(context);
    }

    /**
     * Get comprehensive leaderboard data for a user
     */
    @GetMapping("/user/{userId}/overview")
    public ResponseEntity<Map<String, Object>> getUserLeaderboardOverview(@PathVariable int userId) {
        Map<String, Object> overview = Map.of(
                "pointsRank", leaderboardService.getUserPointsRank(userId),
                "achievementsRank", leaderboardService.getUserAchievementsRank(userId),
                "pointsContext", leaderboardService.getUserLeaderboardContext(userId, 2)
        );

        return ResponseEntity.ok(overview);
    }
}