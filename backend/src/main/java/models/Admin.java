package models;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

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

    public void addCreatedPoll(int pollId) {
        addToCreatedPolls(pollId);
    }

    public void removeCreatedPoll(int pollId) {
        getCreatedPolls().remove(Integer.valueOf(pollId));
    }

    public boolean hasCreatedPoll(int pollId) {
        return getCreatedPolls().contains(pollId);
    }

    public int getCreatedPollsCount() {
        return getCreatedPolls().size();
    }

    public void clearCreatedPolls() {
        getCreatedPolls().clear();
    }

    public void awardPoints(User user, int points) {
        if (points > 0) {
            user.addPoints(points);
        }
    }

    public void removePoints(User user, int points) {
        if (points > 0) {
            user.decreasePoints(points);
        }
    }

    public void verifyUser(User user) {
        user.setVerified(true);
        user.setVerificationCode(null);
    }
}