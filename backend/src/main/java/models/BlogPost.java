package models;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BlogPost {
    private int id;
    private User author;
    private String content;
    private LocalDateTime createdAt;
    private List<Comments> comments;
    private Set<Integer> likedBy;

    public BlogPost(int id, User author, String content, List<Comments> comments) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.comments = comments;
        this.likedBy = new HashSet<>();
    }

    public User getAuthor(){
        return this.author;
    }

    public int getLikes(){
        return this.likedBy.size();
    }

    public String getContent(){
        return this.content;
    }

    public LocalDateTime getCreatedAt(){
        return this.createdAt;
    }

    public List<Comments> getComments(){
        return this.comments;
    }

    public ResultError editContent(String content){
        if(content.trim().equals("")){
            return new ResultError(false, "Content cannot be empty");
        }
        this.content = content;
        return new ResultError(true, "Successfully edited content");
    }

    public ResultError addComment(Comments comment){
        //securitate
        BlogPost post = null;
        //implementare din db
        if(post == null){
            return new ResultError(false,"Post doesn't exist");
        }
        if(comment==null || comment.getContent().isEmpty()){
            return new ResultError(false,"Comment cannot be empty");
        }
        comments.add(comment);
        return new ResultError(true, "");
    }

    public ResultError addLike(User author){
        BlogPost post = null;
        if(post == null){
            return new ResultError(false,"Post doesn't exist");
        }
        if(likedBy.contains(author.getId())){
            likedBy.remove(author.getId());
            return new ResultError(true, "minus");
        }else{
            likedBy.add(author.getId());
            return new ResultError(true, "plus");
        }
    }
}
