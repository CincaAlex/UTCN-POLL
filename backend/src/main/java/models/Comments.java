package models;

import java.time.LocalDateTime;

public class Comments {
    private int id;
    private User author;
    private String comment;
    private LocalDateTime createdAt;

    public Comments(int id, User author, String comment) {
        this.id = id;
        this.author = author;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public String getContent(){
        return this.comment;
    }
}
