package models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("USER")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private int points = 0;

    @Column(name = "verification_code")
    private Integer verificationCode;

    @Column(name = "verified")
    private boolean verified = false;

    @Column(name = "last_spin_date")
    private LocalDate lastSpinDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Simplified: Remove JSON columns that cause serialization issues
    // These will be managed through service layer if needed
    @Transient
    private List<Integer> createdPolls = new ArrayList<>();

    @Transient
    private List<Integer> achievementList = new ArrayList<>();

    @Transient
    private List<Integer> voteList = new ArrayList<>();

    // Constructors
    public User() {
        // Initialize lists to prevent null
        this.createdPolls = new ArrayList<>();
        this.achievementList = new ArrayList<>();
        this.voteList = new ArrayList<>();
    }

    public User(String name, String email, String plainPassword) {
        this.name = name;
        this.email = email;
        this.password = hashPassword(plainPassword);
        this.points = 0;
        this.verified = false;
        this.createdPolls = new ArrayList<>();
        this.achievementList = new ArrayList<>();
        this.voteList = new ArrayList<>();
    }

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Password hashing SHA-256
    private String hashPassword(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // Getter and Setter methods
    public int getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String plainPassword) {
        this.password = hashPassword(plainPassword);
    }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public void addPoints(int points) { this.points += points; }
    public void decreasePoints(int points) {
        this.points = Math.max(0, this.points - points);
    }

    public Integer getVerificationCode() { return verificationCode; }
    public void setVerificationCode(Integer verificationCode) {
        this.verificationCode = verificationCode;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDate getLastSpinDate() { return lastSpinDate; }
    public void setLastSpinDate(LocalDate lastSpinDate) {
        this.lastSpinDate = lastSpinDate;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Integer> getCreatedPolls() {
        return createdPolls != null ? createdPolls : new ArrayList<>();
    }

    public void setCreatedPolls(List<Integer> createdPolls) {
        this.createdPolls = createdPolls;
    }

    public List<Integer> getAchievementList() {
        return achievementList != null ? achievementList : new ArrayList<>();
    }
    public void setAchievementList(List<Integer> achievementList) {
        this.achievementList = achievementList;
    }

    public List<Integer> getVoteList() {
        return voteList != null ? voteList : new ArrayList<>();
    }
    public void setVoteList(List<Integer> voteList) {
        this.voteList = voteList;
    }

    public boolean checkPassword(String plainPassword) {
        return hashPassword(plainPassword).equals(this.password);
    }

    // ✅ IMPORTANT: Expune userType în JSON pentru frontend
    @JsonProperty("userType")
    public String getUserType() {
        if (this instanceof Admin) return "ADMIN";
        if (this instanceof Member) return "MEMBER";
        return "USER";
    }

    // Helper methods for lists
    public void addToCreatedPolls(int pollId) {
        if (!createdPolls.contains(pollId)) {
            createdPolls.add(pollId);
        }
    }

    public void addToAchievementList(int achievementId) {
        if (!achievementList.contains(achievementId)) {
            achievementList.add(achievementId);
        }
    }

    public void addToVoteList(int voteId) {
        if (!voteList.contains(voteId)) {
            voteList.add(voteId);
        }
    }
}