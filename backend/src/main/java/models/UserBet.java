package models;

import jakarta.persistence.*;

@Entity
@Table(name = "user_bets")
public class UserBet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id")
    private int userId;

    @Column(name = "vote_id")
    private int voteId;

    @Column(name = "bet_amount")
    private int betAmount;

    public UserBet() {}

    public UserBet(int userId, int voteId, int betAmount) {
        this.userId = userId;
        this.voteId = voteId;
        this.betAmount = betAmount;
    }

    public int getId() { return id; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public int getVoteId() { return voteId; }
    public void setVoteId(int voteId) { this.voteId = voteId; }
    public int getBetAmount() { return betAmount; }
    public void setBetAmount(int betAmount) { this.betAmount = betAmount; }
}