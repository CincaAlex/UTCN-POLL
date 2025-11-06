package models;

import jakarta.persistence.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

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
    private String password; // parola stocata hashed

    private int points;

    public User() {}

    public User(String name, String email, String plainPassword) {
        this.name = name;
        this.email = email;
        this.password = hashPassword(plainPassword);
        this.points = 0;
    }

    // 🔹 Gestionarea punctelor
    public void addPoints(int points) {
        this.points += points;
    }

    public void decreasePoints(int points) {
        this.points -= points;
        if(this.points < 0) this.points = 0;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    // 🔹 Getter și setter JPA
    public int getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }

    public void setPassword(String plainPassword) {
        this.password = hashPassword(plainPassword);
    }

    private String hashPassword(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public boolean checkPassword(String plainPassword) {
        String hashed = hashPassword(plainPassword);
        return hashed.equals(this.password);
    }
}