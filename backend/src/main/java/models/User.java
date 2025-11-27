package models;

import jakarta.persistence.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
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

    private int points;

    private Integer verificationCode;
    private boolean verified = false;
    private LocalDate lastSpinDate;


    public User() {}

    public User(String name, String email, String plainPassword) {
        this.name = name;
        this.email = email;
        this.password = hashPassword(plainPassword);
        this.points = 0;
        this.verified = false;
    }

    // 🔹 Parola hashing SHA-256
    private String hashPassword(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public LocalDate getLastSpinDate() { return lastSpinDate; }
    public void setLastSpinDate(LocalDate lastSpinDate) { this.lastSpinDate = lastSpinDate; }

    public boolean checkPassword(String plainPassword) {
        return hashPassword(plainPassword).equals(this.password);
    }

    @ManyToMany
    @JoinTable(
            name = "user_achievements",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "achievement_id")
    )
    private Set<Achievement> earnedAchievements = new HashSet<>();

    // Add getter and setter
    public Set<Achievement> getEarnedAchievements() { return earnedAchievements; }
    public void setEarnedAchievements(Set<Achievement> earnedAchievements) {
        this.earnedAchievements = earnedAchievements;
    }

    // 🔹 Getter si setter
    public int getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String plainPassword) { this.password = hashPassword(plainPassword); }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public void addPoints(int points) { this.points += points; }
    public void decreasePoints(int points) { this.points = Math.max(0, this.points - points); }

    public Integer getVerificationCode() { return verificationCode; }
    public void setVerificationCode(Integer verificationCode) { this.verificationCode = verificationCode; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}