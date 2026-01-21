package service;

import models.User;
import models.Achievement;
import org.springframework.stereotype.Service;
import repository.UserRepository;
import repository.AchievementRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    public LeaderboardService() {}

    private UserRepository userRepository;
    private AchievementRepository achievementRepository;

    public LeaderboardService(UserRepository userRepository, AchievementRepository achievementRepository) {
        this.userRepository = userRepository;
        this.achievementRepository = achievementRepository;
    }

    /**
     * Get leaderboard sorted by points (descending)
     */
    public List<User> getPointsLeaderboard(int limit) {
        return userRepository.findTopByOrderByPointsDesc(limit);
    }

    /**
     * Get leaderboard sorted by number of achievements (descending)
     */
    public List<Map<String, Object>> getAchievementsLeaderboard(int limit) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .map(user -> {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("user", user);
                    userData.put("achievementCount", user.getAchievementList().size());
                    userData.put("totalPoints", user.getPoints());
                    return userData;
                })
                .sorted((a, b) -> Integer.compare(
                        (Integer) b.get("achievementCount"),
                        (Integer) a.get("achievementCount")
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get leaderboard for specific achievement type
     */
    public List<Map<String, Object>> getAchievementTypeLeaderboard(Achievement.AchievementType type, int limit) {
        List<Achievement> typeAchievements = achievementRepository.findByTypeAndIsActive(type);
        Set<Integer> typeAchievementIds = typeAchievements.stream()
                .map(Achievement::getId)
                .collect(Collectors.toSet());

        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .map(user -> {
                    long count = user.getAchievementList().stream()
                            .filter(typeAchievementIds::contains)
                            .count();

                    Map<String, Object> userData = new HashMap<>();
                    userData.put("user", user);
                    userData.put(type.name().toLowerCase() + "Count", count);
                    userData.put("totalPoints", user.getPoints());
                    return userData;
                })
                .sorted((a, b) -> Long.compare(
                        (Long) b.get(type.name().toLowerCase() + "Count"),
                        (Long) a.get(type.name().toLowerCase() + "Count")
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get user's rank in points leaderboard
     */
    public int getUserPointsRank(int userId) {
        List<User> allUsers = userRepository.findAllByOrderByPointsDesc();
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId() == userId) {
                return i + 1; // Rank is 1-based
            }
        }
        return -1; // User not found
    }

    /**
     * Get user's rank in achievements leaderboard
     */
    public int getUserAchievementsRank(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return -1;

        List<User> allUsers = userRepository.findAll();
        List<User> sortedUsers = allUsers.stream()
                .sorted((a, b) -> Integer.compare(
                        b.getAchievementList().size(),
                        a.getAchievementList().size()
                ))
                .collect(Collectors.toList());

        for (int i = 0; i < sortedUsers.size(); i++) {
            if (sortedUsers.get(i).getId() == userId) {
                return i + 1;
            }
        }
        return -1;
    }

    /**
     * Get user's position and surrounding users for points leaderboard
     */
    public Map<String, Object> getUserLeaderboardContext(int userId, int contextSize) {
        Map<String, Object> result = new HashMap<>();

        List<User> allUsers = userRepository.findAllByOrderByPointsDesc();
        int userIndex = -1;

        // Find user index
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId() == userId) {
                userIndex = i;
                break;
            }
        }

        if (userIndex == -1) {
            result.put("error", "User not found in leaderboard");
            return result;
        }

        // Calculate range to show
        int start = Math.max(0, userIndex - contextSize);
        int end = Math.min(allUsers.size(), userIndex + contextSize + 1);

        List<User> contextUsers = allUsers.subList(start, end);

        result.put("userRank", userIndex + 1);
        result.put("totalUsers", allUsers.size());
        result.put("contextUsers", contextUsers);
        result.put("contextStartRank", start + 1);

        return result;
    }

    /**
     * Get top users by badge tier (users with most high-tier badges)
     */
    public List<Map<String, Object>> getBadgeTierLeaderboard(int limit) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .map(user -> {
                    // Fetch achievements for the user
                    List<Achievement> userAchievements = achievementRepository.findAllById(user.getAchievementList());
                    
                    // Calculate tier score (higher tiers = more points)
                    int tierScore = userAchievements.stream()
                            .mapToInt(Achievement::getBadgeRank)
                            .sum();

                    Map<String, Object> userData = new HashMap<>();
                    userData.put("user", user);
                    userData.put("tierScore", tierScore);
                    userData.put("badgeCount", user.getAchievementList().size());
                    userData.put("totalPoints", user.getPoints());
                    return userData;
                })
                .sorted((a, b) -> Integer.compare(
                        (Integer) b.get("tierScore"),
                        (Integer) a.get("tierScore")
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }
}