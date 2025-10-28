package models;

import com.github.windpapi4j.WinAPICallFailedException;

import java.util.ArrayList;
import java.util.List;

public class Admin extends User{

    private List<Integer> createdPoll = new ArrayList<Integer>();

    public Admin(int id, String name, String email, String password) throws WinAPICallFailedException {
        super(id, name, email, password);
    }

    public List<Integer> getCreatedPoll() {
        return createdPoll;
    }

    public void setCreatedPoll(List<Integer> createdPoll) {
        this.createdPoll = createdPoll;
    }
}
