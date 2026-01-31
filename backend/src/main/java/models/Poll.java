package models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "polls")
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Vote> options = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnore
    private Admin creator;

    @Column(name = "winning_option_id")
    private Integer winningOptionId;

    @Column(name = "resolved")
    private boolean resolved = false;

    public Poll() {
        this.date = LocalDateTime.now();
    }

    public Poll(int id, String title, String description, LocalDateTime date, LocalDateTime endDate, List<Vote> options, Admin admin) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.endDate = endDate;
        this.options = options;
        if (options != null) {
            for (Vote vote : options) {
                vote.setPoll(this);
            }
        }
        this.creator = admin;
    }

    public Integer getWinningOptionId() {
        return winningOptionId;
    }

    public void setWinningOptionId(Integer winningOptionId) {
        this.winningOptionId = winningOptionId;
    }

    @JsonProperty("winningOptionId")
    public Integer getWinningOption() {
        return this.winningOptionId;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    @JsonProperty("resolved")
    public boolean getResolvedStatus() {
        return this.resolved;
    }

    public Map<String, Double> calculateResults() {
        Map<String, Double> results = new HashMap<>();

        if (options == null || options.isEmpty()) {
            return results;
        }

        int totalVotes = options.stream()
                .mapToInt(Vote::getTotalVotes)
                .sum();

        if (totalVotes == 0) {
            return results;
        }

        for (Vote option : options) {
            double percentage = (option.getTotalVotes() * 100.0) / totalVotes;
            results.put(option.getOptionText(), percentage);
        }

        return results;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    public void setCreator(User creator) {
        this.creator = (Admin) creator;
    }

    @JsonProperty("creatorId")
    public int getCreatorId(){
        return this.creator != null ? this.creator.getId() : 0;
    }

    @JsonProperty("creatorName")
    public String getCreatorName() {
        return this.creator != null ? this.creator.getName() : "Unknown";
    }

    @JsonProperty("userVotedOptionIds")
    public List<Integer> getUserVotedOptionIds(Integer userId) {
        if (userId == null || options == null) {
            return new ArrayList<>();
        }

        List<Integer> votedOptionIds = new ArrayList<>();
        for (Vote option : options) {
            if (option.getListUsers() != null && option.getListUsers().contains(userId)) {
                votedOptionIds.add(option.getId());
            }
        }
        return votedOptionIds;
    }

    @JsonProperty("creatorAvatar")
    public String getCreatorAvatar() {
        return null;
    }

    public Admin getCreator() {
        return creator;
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
        if (options != null) {
            for (Vote vote : options) {
                vote.setPoll(this);
            }
        }
    }

    public Vote getVoteOptionById(int optionId) {
        if (options == null) return null;
        return options.stream()
                .filter(vote -> vote.getId() == optionId)
                .findFirst()
                .orElse(null);
    }

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDateTime.now();
        }
        if (endDate == null) {
            endDate = date.plusDays(7);
        }
    }
}