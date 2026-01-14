package models;

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

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Vote> options = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Admin creator;

    // Constructors
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
        // Ensure bidirectional relationship
        if (options != null) {
            for (Vote vote : options) {
                vote.setPoll(this);
            }
        }
        this.creator = admin;
    }

    // Business methods
    public Map<String, Double> calculateResults() {
        Map<String, Double> results = new HashMap<>();

        if (options == null || options.isEmpty()) {
            return results;
        }

        int totalVotes = options.stream()
                .mapToInt(Vote::getTotalVotes)
                .sum();

        if (totalVotes == 0) {
            return results; // No one has voted
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

    public int getCreatorId(){
        return this.creator.getId();
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
        // Ensure bidirectional relationship is maintained
        if (options != null) {
            for (Vote vote : options) {
                vote.setPoll(this);
            }
        }
    }

    // Helper methods for the PollService
    public Vote getVoteOptionById(int optionId) {
        if (options == null) return null;
        return options.stream()
                .filter(vote -> vote.getId() == optionId)
                .findFirst()
                .orElse(null);
    }

    // Pre-persist hook to set default date if not set
    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDateTime.now();
        }
        if (endDate == null) {
            // Default end date: 7 days from creation
            endDate = date.plusDays(7);
        }
    }
}