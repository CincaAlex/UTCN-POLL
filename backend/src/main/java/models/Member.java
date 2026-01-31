package models;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("MEMBER")
public class Member extends User {

    public Member() {
        super();
    }

    public Member(String name, String email, String password) {
        super(name, email, password);
    }

    @Override
    public String getUserType() {
        return "MEMBER";
    }
}