package models;

import com.github.windpapi4j.WinAPICallFailedException;

import java.util.List;

public class Member extends User {

    private List<Integer> achivementList;
    private List<Integer> voteList;



    public Member(int id, String name, String email, String password) throws WinAPICallFailedException {
        super(name, email, password);
    }

    public List<Integer> getAchivementList() {
        return achivementList;
    }

    public void setAchivementList(List<Integer> achivementList) {
        this.achivementList = achivementList;
    }

    public List<Integer> getPollList() {
        return voteList;
    }

    public void setPollList(List<Integer> voteList) {
        this.voteList = voteList;
    }
}
