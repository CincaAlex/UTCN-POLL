package models;

import java.util.ArrayList;
import java.util.List;

public class Vote {

    private int id;
    private List<Integer> listUsers;
    private String optionText;
    private int totalBets;

    public Vote(int id, List<Integer> listUsers) {
        this.id = id;
        this.optionText = optionText;
        this.listUsers = new ArrayList<>();
        this.totalBets = 0;
    }

    public void addVote(int userId, int betAmount) {
        if (!listUsers.contains(userId)) {
            listUsers.add(userId);
            totalBets += betAmount;
        }
    }

    public String getOptionText() {
        return optionText;
    }

    public int getTotalVotes() {
        return listUsers.size();
    }

    public int getTotalBets() {
        return totalBets;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public List<Integer> getListUsers() {
        return listUsers;
    }

    public void setListUsers(List<Integer> listUsers) {
        this.listUsers = listUsers;
    }
}
