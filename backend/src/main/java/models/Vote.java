package models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "votes")
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @Column(name = "option_text", nullable = false, length = 500)
    private String optionText;

    @Column(name = "total_bets")
    private int totalBets = 0;

    // ElementCollection for storing user IDs who voted for this option
    @ElementCollection
    @CollectionTable(name = "vote_users", joinColumns = @JoinColumn(name = "vote_id"))
    @Column(name = "user_id")
    private List<Integer> listUsers = new ArrayList<>();

    public Vote() {
        // Default constructor for JPA
    }

    public Vote(String optionText) {
        this.optionText = optionText;
        this.totalBets = 0;
    }

    public Vote(Poll poll, String optionText) {
        this.poll = poll;
        this.optionText = optionText;
        this.totalBets = 0;
    }

    public void addVote(int userId, int betAmount) {
        if (!listUsers.contains(userId)) {
            listUsers.add(userId);
            totalBets += betAmount;
        }
    }

    public void addVote(int userId) {
        if (!listUsers.contains(userId)) {
            listUsers.add(userId);
            totalBets += 1; // Default bet of 1
        }
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public int getTotalVotes() {
        return listUsers.size();
    }

    public int getTotalBets() {
        return totalBets;
    }

    public void setTotalBets(int totalBets) {
        this.totalBets = totalBets;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public List<Integer> getListUsers() {
        return listUsers;
    }

    public void setListUsers(List<Integer> listUsers) {
        this.listUsers = listUsers;
    }
}