package models;

import java.time.LocalDateTime;
import java.util.HashMap;

import java.util.List;

public class Poll {

    private int id;
    private String title;
    private String description;
    private LocalDateTime date;
    private LocalDateTime endDate;
    private List<Vote> options;
    private int creatorId;

    public Poll(int id, String title, String description, LocalDateTime date, LocalDateTime endDate, List<Vote> options) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.endDate = endDate;
        this.options = options;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public List<Vote> getOptions() {
        return options;
    }

    public void setOptions(List<Vote> options) {
        this.options = options;
    }
}
