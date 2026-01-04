package models;

import com.github.windpapi4j.WinAPICallFailedException;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("MEMBER")
public class Member extends User {

    // Many-to-many relationship with achievements
    @ManyToMany
    @JoinTable(
            name = "member_achievements",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "achievement_id")
    )
    private List<Achievement> achievements = new ArrayList<>();

    // Many-to-many relationship with votes
    @ManyToMany
    @JoinTable(
            name = "member_votes",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "vote_id")
    )
    private List<Vote> votes = new ArrayList<>();

    public Member() {}

    public Member(int id, String name, String email, String password) throws WinAPICallFailedException {
        super(name, email, password);
    }

    public List<Achievement> getAchivementList() {
        return achievements;
    }

    public void setAchivementList(List<Achievement> achivementList) {
        this.achievements = achivementList;
    }

    public List<Vote> getPollList() {
        return votes;
    }

    public void setPollList(List<Vote> voteList) {
        this.votes = voteList;
    }
}
