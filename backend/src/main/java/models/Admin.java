package models;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    // JPA requires a no-argument constructor
    public Admin() {
        super();
    }

    public Admin(String name, String email, String password) {
        super(name, email, password);
    }

    @Override
    public String getUserType() {
        return "ADMIN";
    }

    /**
     * Add a poll to the admin's created polls list
     */
    public void addCreatedPoll(int pollId) {
        addToCreatedPolls(pollId);
    }

    /**
     * Remove a poll from the admin's created polls list
     */
    public void removeCreatedPoll(int pollId) {
        getCreatedPolls().remove(Integer.valueOf(pollId));
    }

    /**
     * Check if admin created a specific poll
     */
    public boolean hasCreatedPoll(int pollId) {
        return getCreatedPolls().contains(pollId);
    }

    /**
     * Get count of polls created by this admin
     */
    public int getCreatedPollsCount() {
        return getCreatedPolls().size();
    }

    /**
     * Clear all created polls (for admin deletion or reset)
     */
    public void clearCreatedPolls() {
        getCreatedPolls().clear();
    }

    /**
     * Admin can award points to users
     */
    public void awardPoints(User user, int points) {
        if (points > 0) {
            user.addPoints(points);
        }
    }

    /**
     * Admin can remove points from users
     */
    public void removePoints(User user, int points) {
        if (points > 0) {
            user.decreasePoints(points);
        }
    }

    /**
     * Admin can verify a user manually
     */
    public void verifyUser(User user) {
        user.setVerified(true);
        user.setVerificationCode(null);
    }
}