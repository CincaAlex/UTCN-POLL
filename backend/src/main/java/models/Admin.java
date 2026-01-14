package models;

import com.github.windpapi4j.WinAPICallFailedException;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    @OneToMany(mappedBy = "creator_id", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Poll> createdPolls = new ArrayList<>();

    // JPA requires a no-argument constructor
    public Admin() {
        super();
    }

    public Admin(String name, String email, String password) throws WinAPICallFailedException {
        super(name, email, password);
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
     * Admin-specific method to deactivate a poll
     * (In real implementation, this would call a service)
     */
    public String deactivatePoll(int pollId) {
        if (hasCreatedPoll(pollId)) {
            removeCreatedPoll(pollId);
            return "Poll " + pollId + " deactivated by admin";
        }
        return "Admin does not own poll " + pollId;
    }

    /**
     * Admin-specific method to view all created polls
     */
    public String viewCreatedPolls() {
        StringBuilder sb = new StringBuilder();
        sb.append("Admin ").append(getName()).append(" created polls:\n");
        if (getCreatedPolls().isEmpty()) {
            sb.append("  No polls created yet");
        } else {
            for (Integer pollId : getCreatedPolls()) {
                sb.append("  Poll ID: ").append(pollId).append("\n");
            }
        }
        return sb.toString();
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