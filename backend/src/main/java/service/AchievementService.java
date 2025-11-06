package service;

import models.Achievement;
import models.ResultError;
import org.springframework.stereotype.Service;
import repository.AchievementRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;

    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    public Optional<Achievement> getAchievementById(int id) {
        return achievementRepository.findById(id);
    }

    public ResultError createAchievement(Achievement achievement) {
        achievementRepository.save(achievement);
        return new ResultError(true, "Achievement created successfully");
    }

    public ResultError updateAchievement(int achievementId, Achievement updatedAchievement) {
        Optional<Achievement> achievementOpt = achievementRepository.findById(achievementId);
        if (achievementOpt.isEmpty()) return new ResultError(false, "Achievement not found");

        Achievement existingAchievement = achievementOpt.get();

        // Update the existing achievement with new data
        // You'll need to add update methods in the Achievement model class
        // For example: existingAchievement.updateFrom(updatedAchievement);

        achievementRepository.save(existingAchievement);
        return new ResultError(true, "Achievement updated successfully");
    }

    public ResultError deleteAchievement(int achievementId) {
        Optional<Achievement> achievementOpt = achievementRepository.findById(achievementId);
        if (achievementOpt.isEmpty()) return new ResultError(false, "Achievement not found");

        achievementRepository.delete(achievementOpt.get());
        return new ResultError(true, "Achievement deleted successfully");
    }
}