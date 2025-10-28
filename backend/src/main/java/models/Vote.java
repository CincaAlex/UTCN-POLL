package models;

import java.util.List;

public class Vote {

    private int id;
    private List<Integer> listUsers;

    public Vote(int id, List<Integer> listUsers) {
        this.id = id;
        this.listUsers = listUsers;
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
