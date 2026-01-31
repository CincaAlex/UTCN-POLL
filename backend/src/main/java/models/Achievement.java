package models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AchievementType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeTier tier;

    @Column(name = "points_required")
    private Integer pointsRequired;

    @Column(name = "action_count_required")
    private Integer actionCountRequired;

    @Column(name = "custom_image_url")
    private String customImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    public Achievement(){
    }

    public Achievement(String name, String description, AchievementType type, BadgeTier tier) {
        this();
        this.name = name;
        this.description = description;
        this.type = type;
        this.tier = tier;
    }

    public enum AchievementType {
        POST_COUNT("post"),
        COMMENT_COUNT("comment"),
        LIKE_COUNT("like"),
        BLOG_LEVEL("level"),
        COMMUNITY_CONTRIBUTOR("community"),
        EARLY_ADOPTER("early"),
        CONTENT_QUALITY("quality"),
        SOCIAL_ENGAGEMENT("social"),
        MILESTONE("milestone"),
        SPECIAL("special");

        private final String imagePrefix;

        AchievementType(String imagePrefix) {
            this.imagePrefix = imagePrefix;
        }

        public String getImagePrefix() {
            return imagePrefix;
        }
    }

    public enum BadgeTier {
        BRONZE("bronze", "#CD7F32", 1),
        SILVER("silver", "#C0C0C0", 2),
        GOLD("gold", "#FFD700", 3),
        PLATINUM("platinum", "#E5E4E2", 4),
        DIAMOND("diamond", "#B9F2FF", 5),
        LEGENDARY("legendary", "#FF6B35", 6);

        private final String imageSuffix;
        private final String colorCode;
        private final int rank;

        BadgeTier(String imageSuffix, String colorCode, int rank) {
            this.imageSuffix = imageSuffix;
            this.colorCode = colorCode;
            this.rank = rank;
        }

        public String getImageSuffix() {
            return imageSuffix;
        }

        public String getColorCode() {
            return colorCode;
        }

        public int getRank() {
            return rank;
        }
    }

    public String getBadgeImageUrl() {
        if (customImageUrl != null && !customImageUrl.trim().isEmpty()) {
            return customImageUrl;
        }

        return String.format("/images/badges/%s_%s.png",
                type.getImagePrefix(),
                tier.getImageSuffix());
    }

    public String getBadgeColor() {
        return tier.getColorCode();
    }

    public int getBadgeRank() {
        return tier.getRank();
    }

    public ResultError updateAchievement(Achievement updatedAchievement) {
        if (updatedAchievement.getName() != null && !updatedAchievement.getName().trim().isEmpty()) {
            this.name = updatedAchievement.getName();
        }
        if (updatedAchievement.getDescription() != null && !updatedAchievement.getDescription().trim().isEmpty()) {
            this.description = updatedAchievement.getDescription();
        }
        if (updatedAchievement.getType() != null) {
            this.type = updatedAchievement.getType();
        }
        if (updatedAchievement.getTier() != null) {
            this.tier = updatedAchievement.getTier();
        }
        if (updatedAchievement.getCustomImageUrl() != null) {
            this.customImageUrl = updatedAchievement.getCustomImageUrl().trim().isEmpty() ?
                    null : updatedAchievement.getCustomImageUrl();
        }
        if (updatedAchievement.getPointsRequired() != null) {
            this.pointsRequired = updatedAchievement.getPointsRequired();
        }
        if (updatedAchievement.getActionCountRequired() != null) {
            this.actionCountRequired = updatedAchievement.getActionCountRequired();
        }

        return new ResultError(true, "Achievement updated successfully");
    }

    public boolean isCriteriaMet(int userPoints, int userActionCount) {
        if (pointsRequired != null && userPoints < pointsRequired) {
            return false;
        }
        if (actionCountRequired != null && userActionCount < actionCountRequired) {
            return false;
        }
        return true;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public AchievementType getType() { return type; }
    public void setType(AchievementType type) { this.type = type; }

    public BadgeTier getTier() { return tier; }
    public void setTier(BadgeTier tier) { this.tier = tier; }

    public Integer getPointsRequired() { return pointsRequired; }
    public void setPointsRequired(Integer pointsRequired) { this.pointsRequired = pointsRequired; }

    public Integer getActionCountRequired() { return actionCountRequired; }
    public void setActionCountRequired(Integer actionCountRequired) { this.actionCountRequired = actionCountRequired; }

    public String getCustomImageUrl() { return customImageUrl; }
    public void setCustomImageUrl(String customImageUrl) { this.customImageUrl = customImageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}