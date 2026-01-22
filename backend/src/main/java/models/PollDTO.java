package models;

import java.time.LocalDateTime;
import java.util.List;

public class PollDTO {
    private int id;
    private String title;
    private String description;
    private LocalDateTime date;
    private LocalDateTime endDate;
    private List<Vote> options;
    private boolean expired;
    private int creatorId;
    private String creatorName;
    private String creatorAvatar;
    private List<Integer> userVotedOptionIds;

    // Constructor
    public PollDTO(Poll poll, Integer currentUserId) {
        this.id = poll.getId();
        this.title = poll.getTitle();
        this.description = poll.getDescription();
        this.date = poll.getDate();
        this.endDate = poll.getEndDate();
        this.options = poll.getOptions();
        this.expired = poll.isExpired();
        this.creatorId = poll.getCreatorId();
        this.creatorName = poll.getCreatorName();
        this.creatorAvatar = poll.getCreatorAvatar();
        this.userVotedOptionIds = poll.getUserVotedOptionIds(currentUserId);
    }

    // Getters
    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getDate() { return date; }
    public LocalDateTime getEndDate() { return endDate; }
    public List<Vote> getOptions() { return options; }
    public boolean isExpired() { return expired; }
    public int getCreatorId() { return creatorId; }
    public String getCreatorName() { return creatorName; }
    public String getCreatorAvatar() { return creatorAvatar; }
    public List<Integer> getUserVotedOptionIds() { return userVotedOptionIds; }
}